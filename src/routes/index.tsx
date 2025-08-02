import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { HOME_URLS } from '@/constants/constants'
import { Books } from '@/pages/books/Books'
import { Community } from '@/pages/community/Community'
import { Contact } from '@/pages/contact/Contact'
import { Home } from '@/pages/home/Home'
import Login from '@/pages/login/Login'

import NotFound from '../pages/not_found/NotFound'

const AppRoutes = () => {
  return (
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="*" element={<NotFound />} />
        <Route element={<BaseLayout />}>
          <Route path={`/${HOME_URLS.HOME}`} element={<Home />} />
        </Route>
        <Route element={<BaseLayout />}>
          <Route path={`/${HOME_URLS.BOOKS}`} element={<Books />} />
        </Route>
        <Route element={<BaseLayout />}>
          <Route path={`/${HOME_URLS.COMMUNITY}`} element={<Community />} />
        </Route>
        <Route element={<BaseLayout />}>
          <Route path={`/${HOME_URLS.CONTACT}`} element={<Contact />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
