import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import { PublishCornerModal } from '@components/publish/PublishCornerModal'
import { useCallback, useEffect, useState } from 'react'

import { prototypeCatalog } from '@src/features/prototype/catalog'
import { usePrototype } from '@src/features/prototype/PrototypeContext'
import {
  Chip,
  Panel,
  PrototypeButton,
  PrototypePage,
} from '@src/features/prototype/PrototypeUI'

import styles from './MapPage.module.scss'

type UserLocation = { latitude: number; longitude: number }
type PrototypeCorner = (typeof prototypeCatalog.corners)[number]

export const MapPage = () => {
  const { catalog } = usePrototype()
  const [distance, setDistance] = useState(2)
  const [category, setCategory] = useState('Todo')
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState<UserLocation | null>(null)
  const [locationDenied, setLocationDenied] = useState(false)
  const [selectedCorner, setSelectedCorner] = useState<PrototypeCorner>(
    catalog.corners[0]
  )
  const [createOpen, setCreateOpen] = useState(false)

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationDenied(true)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setLocationDenied(false)
      },
      () => setLocationDenied(true),
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
    )
  }, [])

  useEffect(() => {
    locate()
  }, [locate])

  return (
    <BaseLayout id="map-page" mainClassName={styles.layoutMain}>
      <PrototypePage className={styles.page}>
        <header className={styles.header}>
          <div>
            <h1>Mapa de rincones</h1>
            <p>
              {location
                ? 'Mostrando lugares cerca de tu ubicación'
                : 'Buenos Aires · ubicación aproximada'}
            </p>
          </div>
          <div>
            <PrototypeButton onClick={locate}>⌖ Mi ubicación</PrototypeButton>
            <PrototypeButton tone="primary" onClick={() => setCreateOpen(true)}>
              ＋ Crear rincón
            </PrototypeButton>
          </div>
        </header>

        <div className={styles.mapLayout}>
          <Panel className={styles.rail} as="aside">
            <label className={styles.search}>
              <span>⌕</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar zona o rincón"
              />
            </label>
            <section>
              <h2>Distancia</h2>
              <div className={styles.distanceValue}>
                Hasta <strong>{distance} km</strong>
              </div>
              <input
                aria-label="Distancia"
                type="range"
                min="1"
                max="10"
                value={distance}
                onChange={(event) => setDistance(Number(event.target.value))}
              />
              <div className={styles.rangeLabels}>
                <span>1 km</span>
                <span>10 km</span>
              </div>
            </section>
            <section>
              <h2>Categorías</h2>
              <div className={styles.categories}>
                {catalog.mapCategories.map((item) => (
                  <Chip
                    key={item}
                    active={category === item}
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </Chip>
                ))}
              </div>
            </section>
            <section>
              <h2>Disponibilidad</h2>
              <label className={styles.switchRow}>
                <span>
                  <strong>Abierto ahora</strong>
                  <small>Rincones disponibles hoy</small>
                </span>
                <input type="checkbox" defaultChecked />
              </label>
              <label className={styles.switchRow}>
                <span>
                  <strong>Con actividad</strong>
                  <small>Lectores en las últimas 2 h</small>
                </span>
                <input type="checkbox" defaultChecked />
              </label>
            </section>
            <section className={styles.activity}>
              <h2>Actividad cercana</h2>
              {catalog.corners.map((corner) => (
                <button
                  key={corner.id}
                  onClick={() => setSelectedCorner(corner)}
                >
                  <span>⌖</span>
                  <span>
                    <strong>{corner.name}</strong>
                    <small>
                      {corner.activity} · {corner.distance}
                    </small>
                  </span>
                </button>
              ))}
            </section>
          </Panel>

          <div
            className={styles.mapCanvas}
            role="img"
            aria-label={`Mapa oscuro con rincones hasta ${distance} kilómetros`}
          >
            <div className={styles.mapGrid} />
            <span className={`${styles.street} ${styles.streetOne}`} />
            <span className={`${styles.street} ${styles.streetTwo}`} />
            <span className={`${styles.street} ${styles.streetThree}`} />
            {catalog.corners.map((corner, index) => (
              <button
                key={corner.id}
                className={`${styles.cornerPin} ${styles[`pin${index + 1}`]}`}
                onClick={() => setSelectedCorner(corner)}
                aria-label={corner.name}
              >
                <span>⌖</span>
                {index === 1 ? <b>3</b> : null}
              </button>
            ))}
            <button
              className={styles.userLocation}
              onClick={locate}
              aria-label="Tu ubicación aproximada"
            >
              <span>⌖</span>
            </button>
            <div className={styles.mapControls}>
              <button aria-label="Acercar">＋</button>
              <button aria-label="Alejar">−</button>
              <button aria-label="Centrar ubicación" onClick={locate}>
                ⌖
              </button>
            </div>
            <Panel className={styles.placeCard} as="article">
              <div className={styles.placeImage}>
                <span>☕</span>
              </div>
              <div>
                <span className={styles.open}>● Abierto ahora</span>
                <h2>{selectedCorner.name}</h2>
                <p>
                  {selectedCorner.category} · {selectedCorner.distance}
                </p>
                <div className={styles.placeMeta}>
                  <span>★ 4,8</span>
                  <span>{selectedCorner.activity}</span>
                </div>
              </div>
              <PrototypeButton tone="primary" size="small">
                Ver rincón
              </PrototypeButton>
            </Panel>
            {locationDenied ? (
              <div className={styles.locationNotice} role="status">
                No pudimos acceder a tu ubicación. Mostramos Buenos Aires.
              </div>
            ) : null}
          </div>
        </div>
      </PrototypePage>

      <PublishCornerModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => setCreateOpen(false)}
      />
    </BaseLayout>
  )
}
