import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'

export interface Notification {
  id: number
  user_id: number
  type: 'visit_reminder' | 'booking_update' | 'payment_received' | 'property_available' | 'system_message'
  title: string
  message: string
  data?: Record<string, any>
  is_read: boolean
  created_at: string
  expires_at?: string
}

interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: number) => void
  markAllAsRead: () => void
  addNotification: (notification: Omit<Notification, 'id' | 'user_id' | 'created_at' | 'is_read'>) => void
  removeNotification: (id: number) => void
}

export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { toast } = useToast()

  // Load notifications from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications')
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications)
        setNotifications(parsed)
      } catch (error) {
        console.error('Failed to parse notifications:', error)
      }
    }
  }, [])

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications))
  }, [notifications])

  // Auto-remove expired notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      setNotifications(prev =>
        prev.filter(notification => {
          if (!notification.expires_at) return true
          return new Date(notification.expires_at) > now
        })
      )
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  const unreadCount = notifications.filter(n => !n.is_read).length

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, is_read: true } : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, is_read: true }))
    )
  }

  const addNotification = (notification: Omit<Notification, 'id' | 'user_id' | 'created_at' | 'is_read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now(), // Simple ID generation
      user_id: 1, // This should come from auth context
      created_at: new Date().toISOString(),
      is_read: false,
    }

    setNotifications(prev => [newNotification, ...prev])

    // Show toast notification for important types
    if (notification.type !== 'system_message') {
      toast({
        title: notification.title,
        description: notification.message,
      })
    }
  }

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification,
  }
}