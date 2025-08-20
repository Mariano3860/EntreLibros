export const getInitials = (username: string) =>
  username.replace(/^@/, '').charAt(0).toUpperCase()

export default getInitials
