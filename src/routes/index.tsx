import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from '../pages/home/Home'
import NotFound from '../pages/not_found/NotFound'
import { Dashboard } from '@/pages/dashboard/Dashboard'
import { BaseLayout } from '@components/layout/BaseLayout/BaseLayout'

const AppRoutes = () => {
  return (
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
        <Route element={<BaseLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>{' '}
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
