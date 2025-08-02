import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { HOME_URLS } from '@/constants/constants'
import { BooksPage } from '@/pages/books/BooksPage'
import { CommunityPage } from '@/pages/community/CommunityPage'
import { ContactPage } from '@/pages/contact/ContactPage'
import { HomePage } from '@/pages/home/HomePage'
import LoginPage from '@/pages/login/LoginPage'

import NotFound from '../pages/not_found/NotFound'

const AppRoutes = () => {
  return (
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="*" element={<NotFound />} />
        <Route element={<BaseLayout />}>
          <Route path={`/${HOME_URLS.HOME}`} element={<HomePage />} />
        </Route>
        <Route element={<BaseLayout />}>
          <Route path={`/${HOME_URLS.BOOKS}`} element={<BooksPage />} />
        </Route>
        <Route element={<BaseLayout />}>
          <Route path={`/${HOME_URLS.COMMUNITY}`} element={<CommunityPage />} />
        </Route>
        <Route element={<BaseLayout />}>
          <Route path={`/${HOME_URLS.CONTACT}`} element={<ContactPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
