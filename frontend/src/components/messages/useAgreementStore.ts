import { useCallback, useState } from 'react'

import type {
  AgreementDetails,
  AgreementVersion,
  AgreementVersionHistoryEntry,
  AgreementVersionStatus,
  Conversation,
  Message,
} from './Messages.types'

type AgreementStoreConversationState = {
  versions: AgreementVersion[]
  activeVersion?: AgreementVersion
}

type AgreementStoreState = Record<number, AgreementStoreConversationState>

export type AgreementStoreErrorCode =
  | 'version_not_found'
  | 'version_inactive'
  | 'version_cancelled'

export class AgreementStoreError extends Error {
  constructor(
    message: string,
    public readonly code: AgreementStoreErrorCode
  ) {
    super(message)
    this.name = 'AgreementStoreError'
  }
}

const isAgreementMessage = (
  message: Message
): message is Message & {
  version: number
} =>
  message.type === 'agreementProposal' ||
  message.type === 'agreementConfirmation' ||
  message.type === 'agreementChange' ||
  message.type === 'agreementCancellation'

const cloneHistory = (history: AgreementVersionHistoryEntry[]) =>
  history.map((entry) => ({ ...entry }))

const markAsInactive = (
  version: AgreementVersion,
  actor: string,
  timestamp: string
): AgreementVersion => {
  if (version.status === 'inactive' || version.status === 'cancelled') {
    return version
  }

  return {
    ...version,
    status: 'inactive',
    history: [
      ...cloneHistory(version.history),
      {
        status: 'inactive' as AgreementVersionStatus,
        changedAt: timestamp,
        changedBy: actor,
      },
    ],
  }
}

const createInitialState = (
  conversations: Conversation[]
): AgreementStoreState => {
  const state: AgreementStoreState = {}

  conversations.forEach((conversation) => {
    const versionsMap = new Map<number, AgreementVersion>()

    const sortedMessages = [...conversation.messages].sort(
      (a, b) => a.id - b.id
    )

    sortedMessages.forEach((message) => {
      if (!isAgreementMessage(message)) return

      const timestamp = new Date().toISOString()

      if (
        message.type === 'agreementProposal' ||
        message.type === 'agreementChange'
      ) {
        const history: AgreementVersionHistoryEntry[] = [
          {
            status: 'pending',
            changedAt: timestamp,
            changedBy:
              message.role === 'me' ? conversation.user.name : 'system',
          },
        ]

        const newVersion: AgreementVersion = {
          version: message.version,
          details:
            message.type === 'agreementProposal'
              ? message.proposal
              : message.proposal,
          status: 'pending',
          confirmedBy: [],
          history,
        }

        versionsMap.set(message.version, newVersion)

        versionsMap.forEach((storedVersion, key) => {
          if (key === message.version) return
          versionsMap.set(
            key,
            markAsInactive(storedVersion, 'system', timestamp)
          )
        })
        return
      }

      const stored = versionsMap.get(message.version)
      if (!stored) {
        return
      }

      if (message.type === 'agreementConfirmation') {
        if (!stored.confirmedBy.includes(message.confirmedBy)) {
          const confirmedBy = [...stored.confirmedBy, message.confirmedBy]
          const status: AgreementVersionStatus =
            confirmedBy.length >= 2 ? 'fullyConfirmed' : 'confirmed'

          versionsMap.set(message.version, {
            ...stored,
            confirmedBy,
            status,
            history: [
              ...cloneHistory(stored.history),
              {
                status,
                changedAt: timestamp,
                changedBy: message.confirmedBy,
              },
            ],
          })
        }
        return
      }

      if (message.type === 'agreementCancellation') {
        versionsMap.set(message.version, {
          ...stored,
          status: 'cancelled',
          history: [
            ...cloneHistory(stored.history),
            {
              status: 'cancelled',
              changedAt: timestamp,
              changedBy: message.cancelledBy,
            },
          ],
        })
      }
    })

    const versions = Array.from(versionsMap.values()).sort(
      (a, b) => a.version - b.version
    )
    const activeVersion = [...versions]
      .reverse()
      .find(
        (version) =>
          version.status !== 'inactive' && version.status !== 'cancelled'
      )

    state[conversation.id] = {
      versions,
      activeVersion,
    }
  })

  return state
}

export const useAgreementStore = (conversations: Conversation[]) => {
  const [agreements, setAgreements] = useState<AgreementStoreState>(() =>
    createInitialState(conversations)
  )

  const getConversationState = useCallback(
    (conversationId: number): AgreementStoreConversationState => {
      return (
        agreements[conversationId] ?? {
          versions: [],
          activeVersion: undefined,
        }
      )
    },
    [agreements]
  )

  const getVersion = useCallback(
    (conversationId: number, versionNumber: number) => {
      const conversationState = getConversationState(conversationId)
      return conversationState.versions.find(
        (version) => version.version === versionNumber
      )
    },
    [getConversationState]
  )

  const proposeVersion = useCallback(
    (conversationId: number, details: AgreementDetails, actor: string) => {
      let createdVersion: AgreementVersion | undefined

      setAgreements((prev) => {
        const timestamp = new Date().toISOString()
        const conversationState = prev[conversationId] ?? {
          versions: [],
          activeVersion: undefined,
        }
        const nextVersionNumber =
          conversationState.versions.reduce(
            (max, version) => Math.max(max, version.version),
            0
          ) + 1

        const updatedVersions = conversationState.versions.map((version) =>
          markAsInactive(version, actor, timestamp)
        )

        createdVersion = {
          version: nextVersionNumber,
          details: { ...details },
          status: 'pending',
          confirmedBy: [],
          history: [
            {
              status: 'pending',
              changedAt: timestamp,
              changedBy: actor,
            },
          ],
        }

        return {
          ...prev,
          [conversationId]: {
            versions: [...updatedVersions, createdVersion!],
            activeVersion: createdVersion!,
          },
        }
      })

      return createdVersion ?? null
    },
    []
  )

  const confirmVersion = useCallback(
    (conversationId: number, versionNumber: number, actor: string) => {
      let result: AgreementVersion | null = null
      let error: AgreementStoreError | null = null

      setAgreements((prev) => {
        const prevState = prev[conversationId] ?? {
          versions: [],
          activeVersion: undefined,
        }
        const targetVersion = prevState.versions.find(
          (version) => version.version === versionNumber
        )

        if (!targetVersion) {
          error = new AgreementStoreError(
            'Version not found',
            'version_not_found'
          )
          return prev
        }

        if (targetVersion.status === 'inactive') {
          error = new AgreementStoreError(
            'Version is inactive',
            'version_inactive'
          )
          return prev
        }

        if (targetVersion.status === 'cancelled') {
          error = new AgreementStoreError(
            'Version is cancelled',
            'version_cancelled'
          )
          return prev
        }

        if (targetVersion.confirmedBy.includes(actor)) {
          result = targetVersion
          return prev
        }

        const timestamp = new Date().toISOString()
        const confirmedBy = [...targetVersion.confirmedBy, actor]
        const status: AgreementVersionStatus =
          confirmedBy.length >= 2 ? 'fullyConfirmed' : 'confirmed'
        const updatedVersion: AgreementVersion = {
          ...targetVersion,
          confirmedBy,
          status,
          history: [
            ...cloneHistory(targetVersion.history),
            { status, changedAt: timestamp, changedBy: actor },
          ],
        }
        const versions = prevState.versions.map((version) =>
          version.version === versionNumber ? updatedVersion : version
        )
        result = updatedVersion

        return {
          ...prev,
          [conversationId]: {
            versions,
            activeVersion:
              prevState.activeVersion?.version === versionNumber
                ? updatedVersion
                : prevState.activeVersion,
          },
        }
      })

      if (error) throw error
      return result
    },
    []
  )

  const cancelVersion = useCallback(
    (conversationId: number, versionNumber: number, actor: string) => {
      let result: AgreementVersion | null = null
      let error: AgreementStoreError | null = null

      setAgreements((prev) => {
        const prevState = prev[conversationId] ?? {
          versions: [],
          activeVersion: undefined,
        }
        const targetVersion = prevState.versions.find(
          (version) => version.version === versionNumber
        )

        if (!targetVersion) {
          error = new AgreementStoreError(
            'Version not found',
            'version_not_found'
          )
          return prev
        }

        if (targetVersion.status === 'cancelled') {
          result = targetVersion
          return prev
        }

        const timestamp = new Date().toISOString()
        const updatedVersion: AgreementVersion = {
          ...targetVersion,
          status: 'cancelled',
          history: [
            ...cloneHistory(targetVersion.history),
            {
              status: 'cancelled',
              changedAt: timestamp,
              changedBy: actor,
            },
          ],
        }
        const versions = prevState.versions.map((version) =>
          version.version === versionNumber ? updatedVersion : version
        )
        result = updatedVersion

        const activeVersion =
          prevState.activeVersion?.version === versionNumber
            ? undefined
            : prevState.activeVersion

        return {
          ...prev,
          [conversationId]: {
            versions,
            activeVersion,
          },
        }
      })

      if (error) throw error
      return result
    },
    []
  )

  return {
    agreements,
    getConversationState,
    getVersion,
    proposeVersion,
    confirmVersion,
    cancelVersion,
  }
}
