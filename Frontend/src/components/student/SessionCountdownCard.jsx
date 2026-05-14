import { useEffect, useMemo, useState } from 'react'
import { getAvailableExams } from '../../services/examService'

function SessionCountdownCard() {
  const [targetTimestamp, setTargetTimestamp] = useState(null)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [countdownMode, setCountdownMode] = useState('none')

  useEffect(() => {
    const loadSessionTiming = async () => {
      try {
        const exams = await getAvailableExams()
        const now = Date.now()

        const mappedExams = exams.map((exam) => ({
          ...exam,
          startMs: new Date(exam.startTime).getTime(),
          endMs: new Date(exam.endTime).getTime(),
        }))

        const nextEndingActiveExam = mappedExams
          .filter((exam) => Number.isFinite(exam.startMs) && Number.isFinite(exam.endMs) && exam.startMs <= now && exam.endMs > now)
          .sort((a, b) => a.endMs - b.endMs)[0]

        const nextUpcomingExam = mappedExams
          .filter((exam) => Number.isFinite(exam.startMs) && exam.startMs > now)
          .sort((a, b) => a.startMs - b.startMs)[0]

        if (nextEndingActiveExam) {
          setCountdownMode('active')
          setTargetTimestamp(nextEndingActiveExam.endMs)
          setSecondsLeft(Math.max(0, Math.floor((nextEndingActiveExam.endMs - now) / 1000)))
          return
        }

        if (nextUpcomingExam) {
          setCountdownMode('upcoming')
          setTargetTimestamp(nextUpcomingExam.startMs)
          setSecondsLeft(Math.max(0, Math.floor((nextUpcomingExam.startMs - now) / 1000)))
          return
        }

        if (!nextEndingActiveExam && !nextUpcomingExam) {
          setCountdownMode('none')
          setTargetTimestamp(null)
          setSecondsLeft(0)
          return
        }
      } catch {
        setCountdownMode('none')
        setTargetTimestamp(null)
        setSecondsLeft(0)
      }
    }

    loadSessionTiming()
  }, [])

  useEffect(() => {
    if (!targetTimestamp) {
      return
    }

    const timerId = window.setInterval(() => {
      const nextSeconds = Math.max(0, Math.floor((targetTimestamp - Date.now()) / 1000))
      setSecondsLeft(nextSeconds)
    }, 1000)

    return () => {
      window.clearInterval(timerId)
    }
  }, [targetTimestamp])

  const countdownLabel = useMemo(() => formatDuration(secondsLeft), [secondsLeft])
  const title =
    countdownMode === 'active'
      ? 'Current Session Ends In'
      : countdownMode === 'upcoming'
        ? 'Next Session Starts In'
        : 'No Active Session'

  return (
    <div className="fixed bottom-4 right-4 z-20 max-w-[calc(100vw-2rem)] rounded-[22px] bg-white px-4 py-4 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.35)] sm:bottom-7 sm:right-7 sm:rounded-[28px] sm:px-8 sm:py-6">
      <div className="flex items-center gap-3 sm:gap-5">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#D8F4EE] sm:h-14 sm:w-14">
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#16B8A6] border-r-[#16B8A6]" />
          <span className="text-xs font-semibold text-[#0B278A]">LIVE</span>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-700 sm:text-[0.92rem]">{title}</p>
          <p className="mt-1 text-sm font-bold tracking-[0.04em] text-[#0B278A] sm:text-[1.05rem]">{countdownLabel}</p>
        </div>
      </div>
    </div>
  )
}

function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, '0'))
    .join(':')
}

export default SessionCountdownCard
