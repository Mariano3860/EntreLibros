import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { HOME_URLS } from '@src/constants/constants'
import { AuthRequiredProvider } from '@src/contexts/auth/AuthRequiredContext'
import { BooksPage } from '@src/pages/books/BooksPage'
import { CommunityFeedPage } from '@src/pages/community/CommunityFeedPage'
import { ContactPage } from '@src/pages/contact/ContactPage'
import { HomePage } from '@src/pages/home/HomePage'
import LoginPage from '@src/pages/login/LoginPage'
import { MapPage } from '@src/pages/map/MapPage'
import { MessagesPage } from '@src/pages/messages/MessagesPage'
import { ProfilePage } from '@src/pages/profile/ProfilePage'
import { PublicProfilePage } from '@src/pages/profile/PublicProfilePage'
import RegisterPage from '@src/pages/register/RegisterPage'
import { StatsPage } from '@src/pages/stats/StatsPage'
import { RequireAuth } from '@src/routes/RequireAuth'

import NotFound from '../pages/not_found/NotFound'

const AppRoutes = () => {
  return (
    <BrowserRouter basename="/">
      <AuthRequiredProvider>
        <Routes>
          <Route path={`/${HOME_URLS.LOGIN}`} element={<LoginPage />} />
          <Route path={`/${HOME_URLS.REGISTER}`} element={<RegisterPage />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/" element={<HomePage />} />
          <Route path={`/${HOME_URLS.HOME}`} element={<HomePage />} />
          <Route
            path={`/${HOME_URLS.BOOKS}/new`}
            element={
              <RequireAuth>
                <BooksPage />
              </RequireAuth>
            }
          />
          <Route
            path={`/${HOME_URLS.BOOKS}/mine`}
            element={
              <RequireAuth>
                <BooksPage />
              </RequireAuth>
            }
          />
          <Route path={`/${HOME_URLS.BOOKS}/*`} element={<BooksPage />} />
          <Route
            path={`/${HOME_URLS.COMMUNITY}`}
            element={<CommunityFeedPage />}
          />
          <Route path={`/${HOME_URLS.MAP}`} element={<MapPage />} />
          <Route
            path={`/${HOME_URLS.MESSAGES}`}
            element={
              <RequireAuth>
                <MessagesPage />
              </RequireAuth>
            }
          />
          <Route path="/profile/:id" element={<PublicProfilePage />} />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            }
          />
          <Route
            path={`/${HOME_URLS.STATS}`}
            element={
              <RequireAuth>
                <StatsPage />
              </RequireAuth>
            }
          />
          <Route path={`/${HOME_URLS.CONTACT}`} element={<ContactPage />} />
        </Routes>
      </AuthRequiredProvider>
    </BrowserRouter>
  )
}

export default AppRoutes
