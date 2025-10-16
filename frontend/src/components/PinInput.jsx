import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'

const PinInput = forwardRef(({ length = 4, onComplete, error }, ref) => {
  const [values, setValues] = useState(Array(length).fill(''))
  const inputRefs = useRef([])

  // 暴露聚焦方法给父组件
  useImperativeHandle(ref, () => ({
    focusInput: () => {
      const firstEmptyIndex = values.findIndex(v => v === '')
      const focusIndex = firstEmptyIndex === -1 ? length - 1 : firstEmptyIndex
      inputRefs.current[focusIndex]?.focus()
    }
  }))

  useEffect(() => {
    if (error) {
      setValues(Array(length).fill(''))
      inputRefs.current[0]?.focus()
    }
  }, [error, length])

  useEffect(() => {
    // 页面加载时自动聚焦第一个输入框
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (index, value) => {
    // 只允许数字
    if (value && !/^\d$/.test(value)) {
      return
    }

    const newValues = [...values]
    newValues[index] = value

    setValues(newValues)

    // 自动跳转到下一个输入框
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // 检查是否全部输入完成
    if (newValues.every(v => v !== '')) {
      onComplete?.(newValues.join(''))
    }
  }

  const handleKeyDown = (index, e) => {
    // 处理退格键
    if (e.key === 'Backspace') {
      if (!values[index] && index > 0) {
        // 当前框为空，跳到前一个框
        inputRefs.current[index - 1]?.focus()
      } else if (values[index]) {
        // 当前框有值，清空它
        const newValues = [...values]
        newValues[index] = ''
        setValues(newValues)
      }
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, length)
    const digits = pastedData.replace(/\D/g, '').split('')

    if (digits.length > 0) {
      const newValues = [...values]
      digits.forEach((digit, i) => {
        if (i < length) {
          newValues[i] = digit
        }
      })
      setValues(newValues)

      // 聚焦到下一个空输入框或最后一个
      const nextEmptyIndex = newValues.findIndex(v => v === '')
      const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex
      inputRefs.current[focusIndex]?.focus()

      // 如果全部填充完成
      if (newValues.every(v => v !== '')) {
        onComplete?.(newValues.join(''))
      }
    }
  }

  return (
    <div className="flex gap-4">
      {values.map((value, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={value}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          autoFocus={index === 0}
          onMouseDown={(e) => {
            // 阻止点击导致的焦点转移
            e.preventDefault()
          }}
          className={`w-16 h-16 text-center text-4xl font-semibold border-2 rounded-lg outline-none caret-transparent transition-all duration-200 ease-in-out pointer-events-none
            ${error
              ? 'border-[var(--color-destructive)] animate-shake'
              : 'border-[var(--color-input)]'
            }
          `}
          style={{
            textAlign: 'center',
            lineHeight: '64px',
            paddingBottom: '0.2rem',
            caretColor: 'transparent',
            pointerEvents: 'auto'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'black'
            e.target.style.transform = 'scale(1.05)'
          }}
          onBlur={(e) => {
            // 阻止失去焦点，立即重新聚焦
            setTimeout(() => {
              const firstEmptyIndex = values.findIndex(v => v === '')
              const focusIndex = firstEmptyIndex === -1 ? length - 1 : firstEmptyIndex
              inputRefs.current[focusIndex]?.focus()
            }, 0)
            e.target.style.borderColor = 'var(--color-input)'
            e.target.style.transform = 'scale(1)'
          }}
        />
      ))}
    </div>
  )
})

PinInput.displayName = 'PinInput'

export default PinInput
