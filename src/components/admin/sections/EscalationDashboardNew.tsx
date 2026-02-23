'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  AlertTriangle, 
  Clock, 
  User, 
  ArrowRight,
  Search,
  Filter
} from 'lucide-react'

interface EscalationAlert {
  id: string
  studentId: string
  studentName: string
  studentClass?: string
  studentEmail: string
  sessionId: string
  category: string
  level: string
  severity: number
  confidence: number
  detectedPhrases: string[]
  context: string
  recommendation: string
  description: string
  detectionMethod: string
  messageContent: string
  messageTimestamp: string
  requiresImmediateAction: boolean
  status: string
  priority: string
  assignedTo?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

interface AlertDetailModalProps {
  alert: EscalationAlert | null
  isOpen: boolean
  onClose: () => void
  onUpdateStatus: (alertId: string, status: string, notes?: string) => void
}

function AlertDetailModal({ alert, isOpen, onClose, onUpdateStatus }: AlertDetailModalProps) {
  const [notes, setNotes] = useState(alert?.notes || '')
  const [updating, setUpdating] = useState(false)

  if (!isOpen || !alert) return null

  const handleUpdateStatus = async (status: string) => {
    setUpdating(true)
    await onUpdateStatus(alert.id, status, notes)
    setUpdating(false)
    onClose()
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const alertTime = new Date(timestamp)
    const diffMs = now.getTime() - alertTime.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`
    return `${Math.floor(diffMins / 1440)} days ago`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Alert Details</h2>
              <p className="text-gray-600 mt-1">{getTimeAgo(alert.createdAt)}</p>
            </div>
            <Button variant="ghost" onClick={onClose}>
              ×
            </Button>
          </div>

          {/* Student Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Student Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Name:</span>
                  <p className="font-medium">{alert.studentName}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Class:</span>
                  <p className="font-medium">{alert.studentClass || 'Not assigned'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Student ID:</span>
                  <p className="font-medium">{alert.studentId}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Email:</span>
                  <p className="font-medium">{alert.studentEmail}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Alert Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Alert Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Priority:</span>
                <Badge className={
                  alert.priority === 'critical' ? 'bg-red-500 text-white' :
                  alert.priority === 'high' ? 'bg-orange-500 text-white' :
                  alert.priority === 'medium' ? 'bg-yellow-500 text-black' :
                  'bg-blue-500 text-white'
                }>
                  {alert.priority.toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge className={
                  alert.status === 'open' ? 'bg-orange-100 text-orange-800' :
                  alert.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                  alert.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }>
                  {alert.status.toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium">{alert.category.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Detection Method:</span>
                <span className="font-medium">{alert.detectionMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Confidence:</span>
                <span className="font-medium">{Math.round(alert.confidence * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Description</h3>
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <p className="text-gray-800">{alert.description}</p>
            </div>
          </div>

          {/* Message Content */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Original Message</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-800">{alert.messageContent}</p>
            </div>
          </div>

          {/* Context */}
          {alert.context && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Conversation Context</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-800">{alert.context}</p>
              </div>
            </div>
          )}

          {/* Recommendation */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Recommendation</h3>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-gray-800">{alert.recommendation}</p>
            </div>
          </div>

          {/* Detected Phrases */}
          {alert.detectedPhrases.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Detected Phrases</h3>
              <div className="flex flex-wrap gap-2">
                {alert.detectedPhrases.map((phrase, index) => (
                  <Badge key={index} variant="outline" className="bg-red-100 text-red-800 border-red-300">
                    {phrase}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Notes</h3>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg"
              rows={4}
              placeholder="Add notes about this alert..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {alert.status === 'open' && (
              <>
                <Button
                  onClick={() => handleUpdateStatus('reviewed')}
                  disabled={updating}
                  variant="outline"
                >
                  Mark as Reviewed
                </Button>
                <Button
                  onClick={() => handleUpdateStatus('resolved')}
                  disabled={updating}
                >
                  Mark as Resolved
                </Button>
                <Button
                  onClick={() => handleUpdateStatus('false_positive')}
                  disabled={updating}
                  variant="outline"
                  className="text-gray-600"
                >
                  False Positive
                </Button>
              </>
            )}
          </div>

          {/* Timestamps */}
          <div className="mt-6 pt-6 border-t text-sm text-gray-500">
            <div>Created: {formatTime(alert.createdAt)}</div>
            <div>Updated: {formatTime(alert.updatedAt)}</div>
            <div>Session ID: {alert.sessionId}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function EscalationDashboard() {
  const [alerts, setAlerts] = useState<EscalationAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAlert, setSelectedAlert] = useState<EscalationAlert | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch alerts from real API
  const fetchAlerts = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/students/escalations?status=${statusFilter}&limit=100`)
      if (!response.ok) {
        throw new Error('Failed to fetch alerts')
      }
      
      const data = await response.json()
      
      // Filter by search term and priority
      const filteredAlerts = data.alerts.filter((alert: EscalationAlert) => {
        const matchesSearch = alert.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            alert.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            alert.description.toLowerCase().includes(searchTerm.toLowerCase())
        
        const matchesPriority = priorityFilter === 'all' || alert.priority === priorityFilter
        
        return matchesSearch && matchesPriority
      })

      setAlerts(filteredAlerts)

    } catch (error) {
      console.error('Error fetching escalation data:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
  }, [statusFilter, priorityFilter, searchTerm])

  // Update alert status using real API
  const updateAlertStatus = async (alertId: string, status: string, notes?: string) => {
    try {
      const response = await fetch('/api/students/escalations', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alertId,
          status,
          notes,
          assignedTo: 'current-admin'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update alert')
      }

      // Refresh the alerts list
      await fetchAlerts()

    } catch (error) {
      console.error('Error updating alert:', error)
      setError(error instanceof Error ? error.message : 'Failed to update alert')
    }
  }

  // Open alert detail modal
  const openAlertDetail = (alert: EscalationAlert) => {
    setSelectedAlert(alert)
    setIsModalOpen(true)
  }

  // Calculate stats
  const stats = {
    open: alerts.filter(a => a.status === 'open').length,
    highPriority: alerts.filter(a => a.priority === 'high' || a.priority === 'critical').length,
    resolved: alerts.filter(a => a.status === 'resolved').length
  }

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white'
      case 'high': return 'bg-red-500 text-white'
      case 'medium': return 'bg-yellow-500 text-black'
      case 'low': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-orange-100 text-orange-800'
      case 'reviewed': return 'bg-blue-100 text-blue-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'false_positive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Get time ago
  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const alertTime = new Date(timestamp)
    const diffMs = now.getTime() - alertTime.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`
    return `${Math.floor(diffMins / 1440)} days ago`
  }

  if (loading && alerts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading escalation alerts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Escalation Dashboard</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open</p>
                <p className="text-3xl font-bold text-gray-900">{stats.open}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-3xl font-bold text-gray-900">{stats.highPriority}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-3xl font-bold text-gray-900">{stats.resolved}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <div className="h-6 w-6 bg-green-600 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="false_positive">False Positive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500">No escalation alerts found</p>
            </CardContent>
          </Card>
        ) : (
          alerts.map((alert) => (
            <Card key={alert.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Student Info */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-full ${
                        alert.priority === 'critical' || alert.priority === 'high' 
                          ? 'bg-red-100' 
                          : 'bg-green-100'
                      }`}>
                        <AlertTriangle className={`h-5 w-5 ${
                          alert.priority === 'critical' || alert.priority === 'high'
                            ? 'text-red-600'
                            : 'text-green-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {alert.studentName} {alert.studentClass && `${alert.studentClass}`}
                        </h3>
                        <p className="text-sm text-gray-600">{alert.studentEmail}</p>
                      </div>
                    </div>

                    {/* Alert Description */}
                    <p className="text-gray-800 mb-3">{alert.description}</p>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{getTimeAgo(alert.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{alert.detectionMethod}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(alert.priority)}>
                        {alert.priority.toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(alert.status)}>
                        {alert.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openAlertDetail(alert)}
                    className="ml-4"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Alert Detail Modal */}
      <AlertDetailModal
        alert={selectedAlert}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdateStatus={updateAlertStatus}
      />
    </div>
  )
}
