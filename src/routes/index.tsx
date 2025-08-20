import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { HOME_URLS } from '@src/constants/constants'
import { BooksPage } from '@src/pages/books/BooksPage'
import { CommunityPage } from '@src/pages/community/CommunityPage'
import { ContactPage } from '@src/pages/contact/ContactPage'
import { HomePage } from '@src/pages/home/HomePage'
import LoginPage from '@src/pages/login/LoginPage'
import RegisterPage from '@src/pages/register/RegisterPage'

import NotFound from '../pages/not_found/NotFound'

const AppRoutes = () => {
  return (
    <BrowserRouter basename="/">
      <Routes>
        <Route path={`/${HOME_URLS.LOGIN}`} element={<LoginPage />} />
        <Route path={`/${HOME_URLS.REGISTER}`} element={<RegisterPage />} />
        <Route path="*" element={<NotFound />} />
        <Route element={<BaseLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path={`/${HOME_URLS.HOME}`} element={<HomePage />} />
        </Route>
        <Route element={<BaseLayout />}>
          <Route path={`/${HOME_URLS.BOOKS}/*`} element={<BooksPage />} />
        </Route>
        <Route element={<BaseLayout />}>
          <Route
            path={`/${HOME_URLS.COMMUNITY}/*`}
            element={<CommunityPage />}
          />
        </Route>
        <Route element={<BaseLayout />}>
          <Route path={`/${HOME_URLS.CONTACT}`} element={<ContactPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
