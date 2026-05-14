import { useEffect, useRef, useState } from 'react'
import * as blazeface from '@tensorflow-models/blazeface'
import '@tensorflow/tfjs'

const DETECTION_INTERVAL_MS = 1000
const WARNING_THRESHOLD_SECONDS = 10
const AUTO_SUBMIT_THRESHOLD_SECONDS = 15

function FaceProctor({ isActive = true, onAutoSubmit, className = '' }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const modelRef = useRef(null)
  const detectionIntervalRef = useRef(null)
  const isProcessingRef = useRef(false)
  const autoSubmitTriggeredRef = useRef(false)
  const onAutoSubmitRef = useRef(onAutoSubmit)

  const [isCameraReady, setIsCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [noFaceDuration, setNoFaceDuration] = useState(0)
  const [multipleFaceDuration, setMultipleFaceDuration] = useState(0)
  const [faceCount, setFaceCount] = useState(0)

  useEffect(() => {
    onAutoSubmitRef.current = onAutoSubmit
  }, [onAutoSubmit])

  const stopDetectionLoop = () => {
    if (detectionIntervalRef.current) {
      window.clearInterval(detectionIntervalRef.current)
      detectionIntervalRef.current = null
    }
  }

  const stopCameraStream = () => {
    const stream = streamRef.current
    if (!stream) {
      return
    }

    stream.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }

  useEffect(() => {
    if (!isActive) {
      stopDetectionLoop()
      stopCameraStream()
      autoSubmitTriggeredRef.current = false
      setNoFaceDuration(0)
      setMultipleFaceDuration(0)
      setFaceCount(0)
      setIsCameraReady(false)
      return
    }

    let isMounted = true
    autoSubmitTriggeredRef.current = false

    const startCameraAndDetection = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 320 },
            height: { ideal: 240 },
            facingMode: 'user',
          },
          audio: false,
        })

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }

        if (!modelRef.current) {
          modelRef.current = await blazeface.load()
        }

        if (!isMounted) {
          return
        }

        setIsCameraReady(true)
        setCameraError('')
        setMultipleFaceDuration(0)

        detectionIntervalRef.current = window.setInterval(async () => {
          if (!videoRef.current || !modelRef.current || isProcessingRef.current) {
            return
          }

          if (videoRef.current.readyState < 2) {
            return
          }

          isProcessingRef.current = true

          try {
            const predictions = await modelRef.current.estimateFaces(videoRef.current, false)
            const detectedFaceCount = predictions.length
            setFaceCount(detectedFaceCount)

            if (detectedFaceCount > 1) {
              setNoFaceDuration(0)
              setMultipleFaceDuration((previous) => {
                const nextDuration = previous + 1

                if (
                  nextDuration >= AUTO_SUBMIT_THRESHOLD_SECONDS &&
                  !autoSubmitTriggeredRef.current
                ) {
                  autoSubmitTriggeredRef.current = true
                  stopDetectionLoop()
                  stopCameraStream()
                  Promise.resolve(onAutoSubmitRef.current?.('multiple_face_auto_submit'))
                }

                return nextDuration
              })

              return
            }

            setMultipleFaceDuration(0)
            const hasFace = detectedFaceCount === 1

            if (hasFace) {
              setNoFaceDuration(0)
              return
            }

            setNoFaceDuration((previous) => {
              const nextDuration = previous + 1

              if (
                nextDuration >= AUTO_SUBMIT_THRESHOLD_SECONDS &&
                !autoSubmitTriggeredRef.current
              ) {
                autoSubmitTriggeredRef.current = true
                stopDetectionLoop()
                stopCameraStream()
                Promise.resolve(onAutoSubmitRef.current?.('no_face_auto_submit'))
              }

              return nextDuration
            })
          } catch {
            // Keep detection loop resilient to transient model/camera errors.
          } finally {
            isProcessingRef.current = false
          }
        }, DETECTION_INTERVAL_MS)
      } catch {
        if (!isMounted) {
          return
        }

        setCameraError('Unable to access webcam. Please allow camera permission.')
        setIsCameraReady(false)
      }
    }

    startCameraAndDetection()

    return () => {
      isMounted = false
      stopDetectionLoop()
      stopCameraStream()
    }
  }, [isActive])

  const showNoFaceWarning = noFaceDuration >= WARNING_THRESHOLD_SECONDS
  const showMultipleFaceWarning = multipleFaceDuration >= WARNING_THRESHOLD_SECONDS
  const secondsUntilAutoSubmit = Math.max(0, AUTO_SUBMIT_THRESHOLD_SECONDS - noFaceDuration)
  const secondsUntilMultiFaceAutoSubmit = Math.max(0, AUTO_SUBMIT_THRESHOLD_SECONDS - multipleFaceDuration)
  const statusLabel =
    faceCount > 1 ? 'Multiple faces detected' : faceCount === 1 ? 'Face detected' : 'No face detected'

  return (
    <>
      <div className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
        <div className="border-b border-slate-100 px-3 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Live Proctor Camera</p>
        </div>
        <div className="relative mt-3 overflow-hidden rounded-xl bg-slate-950">
          <video ref={videoRef} autoPlay playsInline muted className="h-40 w-full object-cover" />
          {!isCameraReady ? (
            <p className="absolute inset-0 flex items-center justify-center bg-slate-900/65 px-3 text-center text-xs font-medium text-white">
              {cameraError || 'Starting camera...'}
            </p>
          ) : null}
        </div>
        <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs">
          <p className="font-semibold text-slate-700">Status: {statusLabel}</p>
          <p className="mt-1 text-slate-600">No-face duration: {noFaceDuration}s</p>
          <p className="mt-1 text-slate-600">No-face auto submit in: {secondsUntilAutoSubmit}s</p>
          <p className="mt-1 text-slate-600">Multi-face duration: {multipleFaceDuration}s</p>
          <p className="mt-1 text-slate-600">Multi-face auto submit in: {secondsUntilMultiFaceAutoSubmit}s</p>
        </div>
      </div>

      {showNoFaceWarning ? (
        <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 shadow-md">
          Face not detected. Please remain visible in camera.
        </div>
      ) : null}

      {showMultipleFaceWarning ? (
        <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 shadow-md">
          Multiple faces detected. Please ensure only one person is visible.
        </div>
      ) : null}
    </>
  )
}

export default FaceProctor