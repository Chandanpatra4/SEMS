import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import FaceProctor from '../../components/student/FaceProctor'
import { logActivity } from '../../services/activityService'
import { getExamById } from '../../services/examService'
import { getMyResults, submitExam } from '../../services/resultService'

function StudentExamPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [exam, setExam] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [visited, setVisited] = useState(new Set([0]))
  const [markedForReview, setMarkedForReview] = useState(new Set())
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tabSwitchCount, setTabSwitchCount] = useState(0)
  const [tabWarning, setTabWarning] = useState('')
  const [policyWarning, setPolicyWarning] = useState('')
  const [proctorWarning, setProctorWarning] = useState('')

  const isSubmittingRef = useRef(false)
  const hasSubmittedRef = useRef(false)
  const tabSwitchCountRef = useRef(0)

  const questions = exam?.questions || []
  const currentQuestion = questions[currentIndex]

  const logProctoringEvent = useCallback(
    async (activityType, { force = false } = {}) => {
      if (!exam?._id || (!force && hasSubmittedRef.current)) {
        return
      }

      try {
        await logActivity({
          examId: exam._id,
          activityType,
        })
      } catch {
        // Keep exam flow uninterrupted even if logging fails.
      }
    },
    [exam?._id]
  )

  useEffect(() => {
    const loadExam = async () => {
      setIsLoading(true)
      setError('')

      try {
        const storedUser = localStorage.getItem('user')
        const user = storedUser ? JSON.parse(storedUser) : null

        if (String(user?.status || '').toLowerCase() === 'inactive') {
          navigate('/student/dashboard', {
            replace: true,
            state: {
              inactiveBlocked: true,
            },
          })
          return
        }

        const [examData, resultData] = await Promise.all([getExamById(id), getMyResults()])
        const hasAttempted = resultData.some(
          (result) => String(result.examId?._id || result.examId) === String(id)
        )

        if (hasAttempted) {
          navigate('/student/results', {
            replace: true,
            state: { alreadyAttempted: true },
          })
          return
        }

        setExam(examData)

        const now = Date.now()
        const examDurationSeconds = Number(examData.duration || 0) * 60
        const endTimeSeconds = Math.floor((new Date(examData.endTime).getTime() - now) / 1000)
        const initialSeconds = Math.max(0, Math.min(examDurationSeconds, endTimeSeconds))

        setSecondsLeft(initialSeconds)
        setCurrentIndex(0)
        setVisited(new Set([0]))
        setMarkedForReview(new Set())
        setAnswers({})
        setTabSwitchCount(0)
        setTabWarning('')
        setPolicyWarning('')
        setProctorWarning('')
        hasSubmittedRef.current = false
        isSubmittingRef.current = false
        tabSwitchCountRef.current = 0
      } catch (apiError) {
        setError(apiError.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadExam()
  }, [id, navigate])

  const handleSubmit = useCallback(
    async (autoSubmit = false, submitReason = 'manual_submit') => {
      if (!exam || isSubmittingRef.current || hasSubmittedRef.current) {
        return
      }

      isSubmittingRef.current = true
      setIsSubmitting(true)
      setError('')

      const formattedAnswers = questions
        .filter((question) => answers[question._id])
        .map((question) => ({
          questionId: question._id,
          selectedOption: answers[question._id],
        }))

      const shouldRedirectToResults =
        submitReason === 'no_face_auto_submit' || submitReason === 'multiple_face_auto_submit'

      try {
        if (submitReason !== 'manual_submit') {
          await logProctoringEvent(submitReason, { force: true })
        }

        hasSubmittedRef.current = true

        await submitExam({
          examId: exam._id,
          answers: formattedAnswers,
        })

        if (document.fullscreenElement) {
          await document.exitFullscreen()
        }

        if (shouldRedirectToResults) {
          navigate('/student/results', {
            replace: true,
            state: {
              autoSubmit,
              reason: submitReason,
            },
          })
        } else {
          navigate('/student/dashboard', {
            replace: true,
            state: {
              examSubmitted: true,
              autoSubmit,
              tabSwitchViolation: tabSwitchCountRef.current >= 3,
            },
          })
        }
      } catch (submitError) {
        setError(submitError.message)
        setIsSubmitting(false)
        isSubmittingRef.current = false
        hasSubmittedRef.current = false
      }
    },
    [answers, exam, logProctoringEvent, navigate, questions]
  )

  useEffect(() => {
    if (isLoading || !exam) {
      return
    }

    const timerId = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerId)
          handleSubmit(true, 'time_expired_auto_submit')
          return 0
        }

        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timerId)
  }, [isLoading, exam, handleSubmit])

  useEffect(() => {
    const enforceFullscreen = async () => {
      if (!document.fullscreenElement) {
        try {
          await document.documentElement.requestFullscreen()
        } catch {
          // Browser may reject fullscreen if not user-initiated.
        }
      }
    }

    const onFullscreenChange = () => {
      if (!document.fullscreenElement && !isSubmittingRef.current && !hasSubmittedRef.current) {
        logProctoringEvent('fullscreen_exit')
        enforceFullscreen()
      }
    }

    enforceFullscreen()
    document.addEventListener('fullscreenchange', onFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange)
    }
  }, [logProctoringEvent])

  useEffect(() => {
    const onVisibilityChange = () => {
      if (!document.hidden || isSubmittingRef.current || hasSubmittedRef.current) {
        return
      }

      const nextCount = tabSwitchCountRef.current + 1
      tabSwitchCountRef.current = nextCount
      setTabSwitchCount(nextCount)
      logProctoringEvent('tab_switch')

      if (nextCount === 2) {
        const warning = 'Warning: You have only one chance left. Another tab switch will auto-submit your exam.'
        setTabWarning(warning)
        window.alert(warning)
      }

      if (nextCount >= 3) {
        setTabWarning('Third tab switch detected. Your exam is being auto-submitted.')
        handleSubmit(true, 'tab_switch_auto_submit')
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [handleSubmit, logProctoringEvent])

  useEffect(() => {
    let warningTimeoutId = null

    const onCopyLikeAction = (event) => {
      event.preventDefault()
      setPolicyWarning('Copy, paste, cut, and right-click are disabled during exam.')

      if (warningTimeoutId) {
        window.clearTimeout(warningTimeoutId)
      }

      warningTimeoutId = window.setTimeout(() => {
        setPolicyWarning('')
      }, 2500)
    }

    const onKeyDown = (event) => {
      const key = String(event.key || '').toLowerCase()
      const blockedWithModifier =
        (event.ctrlKey || event.metaKey) && ['c', 'x', 'v', 'a', 's', 'u', 'p'].includes(key)

      if (blockedWithModifier) {
        event.preventDefault()
        setPolicyWarning('Copy, paste, cut, and right-click are disabled during exam.')

        if (warningTimeoutId) {
          window.clearTimeout(warningTimeoutId)
        }

        warningTimeoutId = window.setTimeout(() => {
          setPolicyWarning('')
        }, 2500)
      }
    }

    document.addEventListener('copy', onCopyLikeAction)
    document.addEventListener('cut', onCopyLikeAction)
    document.addEventListener('paste', onCopyLikeAction)
    document.addEventListener('contextmenu', onCopyLikeAction)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      if (warningTimeoutId) {
        window.clearTimeout(warningTimeoutId)
      }

      document.removeEventListener('copy', onCopyLikeAction)
      document.removeEventListener('cut', onCopyLikeAction)
      document.removeEventListener('paste', onCopyLikeAction)
      document.removeEventListener('contextmenu', onCopyLikeAction)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers])

  const handleSelectOption = (questionId, selectedOption) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: selectedOption,
    }))
  }

  const goToQuestion = (index) => {
    setCurrentIndex(index)
    setVisited((prev) => new Set([...prev, index]))
  }

  const handleMarkForReview = () => {
    setMarkedForReview((prev) => {
      const updated = new Set(prev)

      if (updated.has(currentIndex)) {
        updated.delete(currentIndex)
      } else {
        updated.add(currentIndex)
      }

      return updated
    })
  }

  if (isLoading) {
    return <div className="p-8 text-sm text-slate-500">Loading exam...</div>
  }

  if (error && !exam) {
    return <div className="p-8 text-sm font-medium text-red-600">{error}</div>
  }

  if (!exam || !currentQuestion) {
    return <div className="p-8 text-sm text-slate-500">No exam data available.</div>
  }

  const selectedOption = answers[currentQuestion._id] || ''

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,#eef2ff_35%,#f8fafc_100%)] p-4 text-slate-900 sm:p-6">
      <header className="sticky top-3 z-20 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/95 px-5 py-3 shadow-sm backdrop-blur">
        <div className="min-w-55">
          <h1 className="text-xl font-bold text-[#0B278A]">Academic Portal</h1>
          <p className="text-xs text-slate-500">{exam.title}</p>
        </div>
        <div className="rounded-xl bg-[#EEF2FF] px-4 py-2 text-sm font-semibold text-[#0B278A] shadow-inner">
          Time Left: {formatTime(secondsLeft)}
        </div>
        <button
          type="button"
          onClick={() => handleSubmit(false)}
          disabled={isSubmitting}
          className="rounded-xl bg-[#064E3B] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#053c2d] disabled:opacity-70"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Exam'}
        </button>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          Tab Switch Count: {tabSwitchCount}/3
        </span>
        <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
          Copy/Paste/Right-click disabled
        </span>
        {tabWarning ? (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            {tabWarning}
          </span>
        ) : null}
        {policyWarning ? (
          <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
            {policyWarning}
          </span>
        ) : null}
        {proctorWarning ? (
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
            {proctorWarning}
          </span>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2.1fr_1fr] xl:gap-7">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Question {currentIndex + 1} of {questions.length}
            </p>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#EEF2FF] px-3 py-1 text-xs font-semibold text-[#1E3A8A]">
                {exam.subject}
              </span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Marks: {currentQuestion.marks || 0}
              </span>
            </div>
          </div>

          <h2 className="text-2xl font-semibold leading-snug text-[#121826] sm:text-3xl">{currentQuestion.questionText}</h2>

          <div className="mt-6 space-y-3">
            {[
              { key: 'A', text: currentQuestion.optionA },
              { key: 'B', text: currentQuestion.optionB },
              { key: 'C', text: currentQuestion.optionC },
              { key: 'D', text: currentQuestion.optionD },
            ].map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => handleSelectOption(currentQuestion._id, option.key)}
                className={`flex w-full items-start gap-4 rounded-xl border px-4 py-4 text-left transition ${
                  selectedOption === option.key
                    ? 'border-[#14B8A6] bg-[#ECFEFB]'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-sm font-semibold text-slate-600">
                  {option.key}
                </span>
                <span className="text-base leading-relaxed text-slate-800 sm:text-lg">{option.text}</span>
              </button>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={() => goToQuestion(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-[#1E3A8A] disabled:opacity-40"
            >
              Previous
            </button>

            <button
              type="button"
              onClick={handleMarkForReview}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              {markedForReview.has(currentIndex) ? 'Unmark Review' : 'Mark for Review'}
            </button>

            <button
              type="button"
              onClick={() => goToQuestion(Math.min(questions.length - 1, currentIndex + 1))}
              disabled={currentIndex === questions.length - 1}
              className="rounded-xl bg-[#0B278A] px-5 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              Next Question
            </button>
          </div>

          {error ? <p className="mt-4 text-sm font-medium text-red-600">{error}</p> : null}
        </article>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <FaceProctor
            className="w-full"
            isActive={!isSubmitting && !hasSubmittedRef.current}
            onAutoSubmit={(reason) => {
              if (reason === 'multiple_face_auto_submit') {
                setProctorWarning('Multiple faces detected for 15 seconds. Your exam is being auto-submitted.')
                return handleSubmit(true, 'multiple_face_auto_submit')
              }

              setProctorWarning('No face detected for 15 seconds. Your exam is being auto-submitted.')
              return handleSubmit(true, 'no_face_auto_submit')
            }}
          />

          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#121826]">Question Grid</h3>
              <p className="text-xs text-slate-500">{answeredCount}/{questions.length} Answered</p>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {questions.map((question, index) => {
                const isAnswered = Boolean(answers[question._id])
                const isVisited = visited.has(index)
                const isCurrent = index === currentIndex
                const isReview = markedForReview.has(index)

                return (
                  <button
                    key={question._id}
                    type="button"
                    onClick={() => goToQuestion(index)}
                    className={`h-10 rounded-lg text-sm font-semibold transition ${
                      isCurrent
                        ? 'bg-[#0B278A] text-white'
                        : isReview
                          ? 'bg-amber-100 text-amber-700'
                          : isAnswered
                            ? 'bg-[#14B8A6] text-white'
                            : isVisited
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-[#EFF3F8] text-slate-500'
                    }`}
                  >
                    {index + 1}
                  </button>
                )
              })}
            </div>
          </section>

          <ScientificCalculator />
        </aside>
      </div>
    </section>
  )
}

function ScientificCalculator() {
  const [expression, setExpression] = useState('')
  const [result, setResult] = useState('0')

  const append = (value) => {
    setExpression((prev) => prev + value)
  }

  const deleteLast = () => {
    setExpression((prev) => prev.slice(0, -1))
  }

  const appendResult = () => {
    if (!result || result === 'Error') {
      return
    }

    setExpression((prev) => prev + result)
  }

  const clearAll = () => {
    setExpression('')
    setResult('0')
  }

  const evaluate = () => {
    if (!expression.trim()) {
      return
    }

    try {
      const normalized = expression
        .replaceAll('mod', '%')
        .replaceAll('^', '**')

      const factorial = (n) => {
        const integerN = Number(n)

        if (!Number.isInteger(integerN) || integerN < 0) {
          throw new Error('Invalid factorial input')
        }

        if (integerN <= 1) {
          return 1
        }

        let output = 1
        for (let index = 2; index <= integerN; index += 1) {
          output *= index
        }

        return output
      }

      const value = Function(
        'factorial',
        `"use strict";
        const {
          abs,
          acos,
          asin,
          atan,
          ceil,
          cos,
          exp,
          floor,
          log,
          log10,
          max,
          min,
          PI,
          pow,
          round,
          sin,
          sqrt,
          tan,
          E,
        } = Math;
        const ln = (valueInput) => log(valueInput);
        const fact = factorial;
        return (${normalized});`
      )(factorial)

      if (!Number.isFinite(value)) {
        throw new Error('Invalid output')
      }

      setResult(String(Number(value.toFixed(10))))
    } catch {
      setResult('Error')
    }
  }

  const calculatorButtons = [
    { label: 'sin', value: 'sin(' },
    { label: 'cos', value: 'cos(' },
    { label: 'tan', value: 'tan(' },
    { label: 'sqrt', value: 'sqrt(' },
    { label: 'asin', value: 'asin(' },
    { label: 'acos', value: 'acos(' },
    { label: 'atan', value: 'atan(' },
    { label: 'ln', value: 'ln(' },
    { label: 'log10', value: 'log10(' },
    { label: 'pow', value: 'pow(' },
    { label: 'abs', value: 'abs(' },
    { label: 'fact', value: 'fact(' },
    { label: 'PI', value: 'PI' },
    { label: 'E', value: 'E' },
    { label: 'mod', value: 'mod' },
    { label: '^', value: '^' },
    { label: '7', value: '7' },
    { label: '8', value: '8' },
    { label: '9', value: '9' },
    { label: '/', value: '/' },
    { label: '4', value: '4' },
    { label: '5', value: '5' },
    { label: '6', value: '6' },
    { label: '*', value: '*' },
    { label: '1', value: '1' },
    { label: '2', value: '2' },
    { label: '3', value: '3' },
    { label: '-', value: '-' },
    { label: '0', value: '0' },
    { label: '.', value: '.' },
    { label: '(', value: '(' },
    { label: ')', value: ')' },
    { label: '+', value: '+' },
    { label: ',', value: ',' },
    { label: 'Ans', onClick: appendResult },
    { label: 'DEL', onClick: deleteLast },
  ]

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Scientific Calculator</h3>
      <div className="mt-3 rounded-xl bg-slate-100 px-3 py-2 text-right">
        <p className="min-h-5 text-xs text-slate-500">{expression || '0'}</p>
        <p className="text-2xl font-semibold text-[#1E3A8A]">{result}</p>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2">
        {calculatorButtons.map((button) => (
          <button
            key={button.label}
            type="button"
            onClick={button.onClick || (() => append(button.value || ''))}
            className="rounded-lg bg-[#F4F7FB] px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-[#E9EEF7]"
          >
            {button.label}
          </button>
        ))}
        <button
          type="button"
          onClick={clearAll}
          className="col-span-2 rounded-lg bg-[#FEF2F2] px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-[#FEE2E2]"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={evaluate}
          className="col-span-2 rounded-lg bg-[#0B278A] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#1538a3]"
        >
          =
        </button>
      </div>
    </section>
  )
}

function formatTime(totalSeconds) {
  const safeSeconds = Math.max(0, Number(totalSeconds) || 0)
  const minutes = Math.floor(safeSeconds / 60)
  const seconds = safeSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export default StudentExamPage
