/* eslint-disable no-console */
/* eslint-disable consistent-return */
import React, { useRef, useState, useEffect } from 'react'
import KeyboardEventHandler from 'react-keyboard-event-handler'
import { useSocket } from '@zilahir/use-socket.io-client'
import { useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import styles from './TextScroller.module.scss'
import { keyListeners, SPACE, F6, LEFT, RIGHT, DOWN, UP, PAGEUP, PAGE_DOWN } from '../../utils/consts'
import { toggleFullScreen } from '../../utils/fullScreen'

/**
* @author zilahir
* @function TextScroller
* */

const useInterval = (callback, delay) => {
	const savedCallback = useRef()
	useEffect(() => {
		savedCallback.current = callback
	}, [callback])

	useEffect(() => {
		function tick() {
			savedCallback.current()
		}
		if (delay !== null) {
			const id = setInterval(tick, delay)
			return () => {
				clearInterval(id)
			}
		}
	}, [delay])
}

const Scroller = styled.div`
	max-width: ${props => props.scrollWidth};
	p {
		font-size: ${props => props.fontSize}px;
		letter-spacing: ${props => props.letterSpacing}vw;
		line-height: ${props => props.lineHeight};
		transform: ${props => (props.isFlipped ? 'scaleY(-1)' : null)};
	}
`

const STEP = 5

const TextScroller = props => {
	const [socket] = useSocket(process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : process.env.REACT_APP_BACKEND)
	const { text, scrollSpeed, prompterObject } = props
	const textRef = useRef(null)
	const topRef = useRef(null)
	const bottomRef = useRef(null)
	const [playing, togglePlaying] = useState(false)
	const [position, setPosition] = useState(0)
	const [scrollSpeedValue, setScrollSpeedValue] = useState(scrollSpeed)
	const scrollerRef = useRef(null)
	const { slug } = useParams()

	useInterval(() => {
		setPosition(position + STEP)
		scrollerRef.current.scroll({
			top: position,
		})
	}, playing ? scrollSpeedValue : null)

	if (socket) {
		// socket.emit('room', slug) // TODO: finnish this
		socket.on('isPlaying', ({ prompterId, isPlaying }) => {
			if (prompterId === slug) {
				togglePlaying(isPlaying)
			}
		})

		socket.on('incSpeed', ({ prompterId }) => {
			if (prompterId === slug) {
				setScrollSpeedValue(scrollSpeedValue - 1)
			}
		})
		socket.on('decSpeed', ({ prompterId }) => {
			if (prompterId === slug) {
				setScrollSpeedValue(scrollSpeedValue + 1)
			}
		})
	}

	const scrollHandler = event => {
		setPosition(event.currentTarget.scrollTop)
	}

	useEffect(() => {
		scrollerRef.current.addEventListener('scroll', scrollHandler)
		return () => scrollerRef.current.removeEventListener('scroll', scrollHandler)
	}, [])

	function handleKeyPress(key, e) {
		console.debug('key', key)
		e.preventDefault()
		if (key === SPACE) {
			togglePlaying(!playing)
			if (playing) {
				// startScroll()
			} else {
				// STOP
			}
		} else if (key === F6) {
			toggleFullScreen()
		} else if (key === LEFT) {
			setScrollSpeedValue(scrollSpeedValue + 1)
		} else if (key === RIGHT) {
			setScrollSpeedValue(scrollSpeedValue - 1)
		} else if (key === DOWN) {
			console.debug('down')
			const newPos = position + 20 + STEP
			setPosition(newPos)
			scrollerRef.current.scroll({
				top: position,
			})
		} else if (key === UP) {
			console.debug('down')
			const newPos = position - 500
			setPosition(newPos)
			scrollerRef.current.scroll({
				top: position,
			})
		} else if (key === PAGEUP) {
			topRef.current.scrollIntoView({ behavior: 'smooth' })
		} else if (key === PAGE_DOWN) {
			bottomRef.current.scrollIntoView({ behavior: 'smooth' })
		}
	}
	return (
		<>
			<Scroller
				className={styles.scrollerContainer}
				fontSize={prompterObject.fontSize * 30}
				lineHeight={prompterObject.lineHeight}
				letterSpacing={prompterObject.letterSpacing}
				scrollWidth={prompterObject.scrollWidth}
				isFlipped={prompterObject.isFlipped}
				ref={scrollerRef}
			>
				<div ref={topRef} />
				<div
					className={styles.scroller}
				>
					<p
						ref={textRef}
					>
						{text}
					</p>
				</div>
				<div ref={bottomRef} />
			</Scroller>
			<KeyboardEventHandler
				handleKeys={[...keyListeners]}
				onKeyEvent={(key, e) => handleKeyPress(key, e)}
			/>
		</>
	)
}

TextScroller.propTypes = {
	prompterObject: PropTypes.objectOf(PropTypes.any).isRequired,
	scrollSpeed: PropTypes.number.isRequired,
	text: PropTypes.string.isRequired,
}

export default TextScroller
