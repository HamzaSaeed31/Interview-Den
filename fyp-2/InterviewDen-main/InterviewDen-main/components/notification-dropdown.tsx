"use client"

import { useState, useEffect } from "react"
import { Bell, Check, CheckCheck, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/utils/supabase/client"
import { cn } from "@/lib/utils"

interface Notification {
    id: string
    user_id: string
    type: string
    title: string
    message: string
    read: boolean
    metadata: Record<string, unknown>
    created_at: string
    updated_at: string
}

interface NotificationDropdownProps {
    userType: "candidate" | "company"
}

export function NotificationDropdown({ userType }: NotificationDropdownProps) {
    const supabase = createClient()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const [markingRead, setMarkingRead] = useState<string | null>(null)
    const [markingAllRead, setMarkingAllRead] = useState(false)

    const unreadCount = notifications.filter((n) => !n.read).length

    useEffect(() => {
        fetchNotifications()
    }, [])

    useEffect(() => {
        // Subscribe to real-time updates
        const channel = supabase
            .channel("notifications")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "notifications",
                },
                () => {
                    fetchNotifications()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const fetchNotifications = async () => {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from("notifications")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(20)

            if (error) {
                console.error("Error fetching notifications:", error)
                return
            }

            setNotifications(data || [])
        } catch (error) {
            console.error("Error fetching notifications:", error)
        } finally {
            setLoading(false)
        }
    }

    const markAsRead = async (notificationId: string) => {
        setMarkingRead(notificationId)
        try {
            const { error } = await supabase
                .from("notifications")
                .update({ read: true })
                .eq("id", notificationId)

            if (error) {
                console.error("Error marking notification as read:", error)
                return
            }

            // Update local state
            setNotifications((prev) =>
                prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
            )
        } catch (error) {
            console.error("Error marking notification as read:", error)
        } finally {
            setMarkingRead(null)
        }
    }

    const markAllAsRead = async () => {
        setMarkingAllRead(true)
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser()
            if (!user) return

            const { error } = await supabase
                .from("notifications")
                .update({ read: true })
                .eq("user_id", user.id)
                .eq("read", false)

            if (error) {
                console.error("Error marking all notifications as read:", error)
                return
            }

            // Update local state
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        } catch (error) {
            console.error("Error marking all notifications as read:", error)
        } finally {
            setMarkingAllRead(false)
        }
    }

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

        if (diffInSeconds < 60) return "Just now"
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
        return date.toLocaleDateString()
    }

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "status_update":
                return "📋"
            case "message":
                return "💬"
            case "interview":
                return "🎯"
            case "quiz":
                return "📝"
            default:
                return "🔔"
        }
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                            onClick={markAllAsRead}
                            disabled={markingAllRead}
                        >
                            {markingAllRead ? (
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                                <CheckCheck className="h-3 w-3 mr-1" />
                            )}
                            Mark all as read
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors",
                                        !notification.read && "bg-blue-50/50"
                                    )}
                                >
                                    <span className="text-lg shrink-0">
                                        {getNotificationIcon(notification.type)}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p
                                                className={cn(
                                                    "text-sm font-medium leading-tight",
                                                    !notification.read && "text-foreground",
                                                    notification.read && "text-muted-foreground"
                                                )}
                                            >
                                                {notification.title}
                                            </p>
                                            {!notification.read && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 shrink-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        markAsRead(notification.id)
                                                    }}
                                                    disabled={markingRead === notification.id}
                                                >
                                                    {markingRead === notification.id ? (
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                    ) : (
                                                        <Check className="h-3 w-3" />
                                                    )}
                                                    <span className="sr-only">Mark as read</span>
                                                </Button>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                            {formatTimeAgo(notification.created_at)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                {notifications.length > 0 && (
                    <>
                        <Separator />
                        <div className="p-2">
                            <Button
                                variant="ghost"
                                className="w-full text-sm text-muted-foreground hover:text-foreground"
                                size="sm"
                            >
                                View all notifications
                            </Button>
                        </div>
                    </>
                )}
            </PopoverContent>
        </Popover>
    )
}
