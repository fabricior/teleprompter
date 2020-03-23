/* eslint-disable no-console */
/* eslint-disable consistent-return */
import React, { useRef, useState, useEffect } from 'react'
import KeyboardEventHandler from 'react-keyboard-event-handler'
import { useSocket } from '@zilahir/use-socket.io-client'
import { useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import styles from './TextScroller.module.scss'
import { keyListeners, SPACE, F6 } from '../../utils/consts'
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
	max-width: ${props => props.scrollWidth}
	p {
		font-size: ${props => props.fontSize}px;
		letter-spacing: ${props => props.letterSpacing}vw;
		line-height: ${props => props.lineHeight};
	}
`

const STEP = 5

const TextScroller = props => {
	const [socket] = useSocket(process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : process.env.NODE_ENV === 'production')
	const { text, scrollSpeed, prompterObject } = props
	const textRef = useRef(null)
	const [playing, togglePlaying] = useState(false)
	const [position, setPosition] = useState(0)
	const scrollerRef = useRef(null)
	const { slug } = useParams()

	useInterval(() => {
		setPosition(position + STEP)
		scrollerRef.current.scroll({
			top: position,
		})
	}, playing ? scrollSpeed : null)

	if (socket) {
		socket.on('isPlaying', ({ prompterId, isPlaying }) => {
			console.debug('prompterObject', prompterObject)
			if (prompterId === slug) {
				togglePlaying(isPlaying)
			} else {
				console.debug('this is not your prompt')
			}
			console.debug(`prompterId: ${prompterId}, isPlaying: ${isPlaying}`)
			if (isPlaying) {
				// STOP
			} else {
				// START
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
		}
	}
	return (
		<>
			<Scroller
				className={styles.scrollerContainer}
				fontSize={prompterObject.fontSize * 10}
				lineHeight={prompterObject.lineHeight}
				letterSpacing={prompterObject.letterSpacing}
				scrollWidth={prompterObject.scrollWidth}
				ref={scrollerRef}
			>
				<div
					className={styles.scroller}
				>
					<p
						ref={textRef}
					>
						{text}
					</p>
				</div>
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
