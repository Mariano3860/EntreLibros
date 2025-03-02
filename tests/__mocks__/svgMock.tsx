import React from 'react'

const SvgMock = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} role="img" aria-hidden="true" />
)

export const ReactComponent = SvgMock
export default SvgMock
