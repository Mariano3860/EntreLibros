import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from '../pages/home/Home'
import NotFound from '../pages/not_found/NotFound'
import { Inicio } from '@/pages/dashboard/Inicio'
import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'
import { HOME_URLS } from '@/constants/constants'

const AppRoutes = () => {
  return (
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
        <Route element={<BaseLayout />}>
          <Route path={`/${HOME_URLS.INICIO}`} element={<Inicio />} />
        </Route>
        <Route element={<BaseLayout />}>
          <Route path={`/${HOME_URLS.LIBROS}`} element={<Inicio />} />
        </Route>
        <Route element={<BaseLayout />}>
          <Route path={`/${HOME_URLS.COMUNIDAD}`} element={<Inicio />} />
        </Route>
        <Route element={<BaseLayout />}>
          <Route path={`/${HOME_URLS.CONTACTO}`} element={<Inicio />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
