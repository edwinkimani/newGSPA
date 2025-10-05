export interface User {
  id: string
  email: string
  password: string
  role?: string
  profile?: {
    role?: {
      name: string
    }
  }
}
