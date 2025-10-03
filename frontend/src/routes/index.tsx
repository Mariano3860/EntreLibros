import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { HOME_URLS } from '@src/constants/constants'
import { BooksPage } from '@src/pages/books/BooksPage'
import { CommunityFeedPage } from '@src/pages/community/CommunityFeedPage'
import { ContactPage } from '@src/pages/contact/ContactPage'
import { HomePage } from '@src/pages/home/HomePage'
import LoginPage from '@src/pages/login/LoginPage'
import { MapPage } from '@src/pages/map/MapPage'
import { MessagesPage } from '@src/pages/messages/MessagesPage'
import RegisterPage from '@src/pages/register/RegisterPage'
import { StatsPage } from '@src/pages/stats/StatsPage'

import NotFound from '../pages/not_found/NotFound'

const AppRoutes = () => {
  return (
    <BrowserRouter basename="/">
      <Routes>
        <Route path={`/${HOME_URLS.LOGIN}`} element={<LoginPage />} />
        <Route path={`/${HOME_URLS.REGISTER}`} element={<RegisterPage />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<HomePage />} />
        <Route path={`/${HOME_URLS.HOME}`} element={<HomePage />} />
        <Route path={`/${HOME_URLS.BOOKS}/*`} element={<BooksPage />} />
        <Route
          path={`/${HOME_URLS.COMMUNITY}`}
          element={<CommunityFeedPage />}
        />
        <Route path={`/${HOME_URLS.MAP}`} element={<MapPage />} />
        <Route path={`/${HOME_URLS.MESSAGES}`} element={<MessagesPage />} />
        <Route path={`/${HOME_URLS.STATS}`} element={<StatsPage />} />
        <Route path={`/${HOME_URLS.CONTACT}`} element={<ContactPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
