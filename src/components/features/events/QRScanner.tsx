import React, { useState, useRef } from 'react';
import { Camera, CameraOff, RotateCcw, Check, X, Users } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Avatar } from '@/components/ui';

export interface QRScannerProps {
  eventId: string;
  onScan: (data: any) => void;
  onError: (error: string) => void;
  onClose?: () => void;
}

export interface AttendeeInfo {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  registrationDate: string;
  status: 'registered' | 'checked-in' | 'cancelled';
  ticketType?: string;
}

export const QRScanner: React.FC<QRScannerProps> = ({
  eventId,
  onScan,
  onError,
  onClose,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<AttendeeInfo | null>(null);
  const [scanHistory, setScanHistory] = useState<AttendeeInfo[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<any>(null);

  const startScanning = async () => {
    try {
      setCameraError(null);
      setIsScanning(true);

      // Initialize QR Scanner
      // Note: In a real implementation, you would use a library like qr-scanner
      // For now, we'll simulate the scanner
      console.log('Starting QR scanner for event:', eventId);

    } catch (error) {
      const errorMessage = 'Failed to access camera. Please ensure camera permissions are granted.';
      setCameraError(errorMessage);
      onError(errorMessage);
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (scannerRef.current) {
      // Stop the scanner
      scannerRef.current.stop();
    }
  };

  const handleScanSuccess = (attendee: AttendeeInfo) => {
    setLastScanned(attendee);
    setScanHistory(prev => [attendee, ...prev.slice(0, 9)]); // Keep last 10 scans
    onScan(attendee);

    // Auto-stop scanning after successful scan
    setTimeout(() => {
      stopScanning();
    }, 2000);
  };

  const handleRetry = () => {
    setCameraError(null);
    startScanning();
  };

  const simulateScan = () => {
    // Simulate a successful scan for demo purposes
    const mockAttendee: AttendeeInfo = {
      id: 'mock-' + Date.now(),
      name: 'John Doe',
      email: 'john.doe@example.com',
      avatar: undefined,
      registrationDate: new Date().toISOString(),
      status: 'registered',
      ticketType: 'General Admission',
    };

    handleScanSuccess(mockAttendee);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Check-in Scanner</h2>
          <p className="text-gray-600">Scan QR codes to check-in attendees</p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close Scanner
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              QR Code Scanner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isScanning ? (
              /* Scanner Off State */
              <div className="text-center py-12">
                <CameraOff className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Scanner Inactive
                </h3>
                <p className="text-gray-600 mb-6">
                  Click the button below to start scanning QR codes
                </p>
                <Button onClick={startScanning}>
                  <Camera className="h-4 w-4 mr-2" />
                  Start Scanner
                </Button>
              </div>
            ) : (
              /* Scanning State */
              <div className="space-y-4">
                {/* Camera View */}
                <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                  />

                  {/* Scanner Overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-64 h-64 border-4 border-orange-500 rounded-lg">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-orange-500 rounded-tl-lg"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-orange-500 rounded-tr-lg"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-orange-500 rounded-bl-lg"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-orange-500 rounded-br-lg"></div>
                      </div>
                    </div>

                    {/* Scan Line Animation */}
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent transform -translate-y-1/2">
                      <div className="h-full bg-orange-500 animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Scanner Controls */}
                <div className="flex justify-center gap-3">
                  <Button variant="outline" onClick={stopScanning}>
                    <CameraOff className="h-4 w-4 mr-2" />
                    Stop Scanner
                  </Button>
                  <Button variant="outline" onClick={handleRetry}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                  <Button onClick={simulateScan} variant="ghost">
                    Simulate Scan (Demo)
                  </Button>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Position the QR code within the frame. The scanner will automatically detect and scan it.
                  </p>
                </div>
              </div>
            )}

            {/* Error Display */}
            {cameraError && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <X className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Camera Error</p>
                    <p className="text-sm text-red-600 mt-1">{cameraError}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Scans Section */}
        <div className="space-y-6">
          {/* Last Scanned */}
          {lastScanned && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  Last Scanned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar
                    src={lastScanned.avatar}
                    name={lastScanned.name}
                    size="lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{lastScanned.name}</h4>
                    <p className="text-sm text-gray-600">{lastScanned.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="success" size="sm">
                        Checked In
                      </Badge>
                      {lastScanned.ticketType && (
                        <Badge variant="secondary" size="sm">
                          {lastScanned.ticketType}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Scan History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recent Check-ins
                <span className="text-sm font-normal text-gray-500">
                  ({scanHistory.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {scanHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No check-ins yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Start scanning to see check-in history
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {scanHistory.map((attendee) => (
                    <div
                      key={attendee.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <Avatar
                        src={attendee.avatar}
                        name={attendee.name}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {attendee.name}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {attendee.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="success" size="sm">
                          Checked In
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(attendee.registrationDate).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {scanHistory.length}
                  </p>
                  <p className="text-sm text-gray-600">Checked In</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.floor(Math.random() * 50) + 100}
                  </p>
                  <p className="text-sm text-gray-600">Expected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};