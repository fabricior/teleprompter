import React, { useState, useEffect } from 'react'
import { Col } from 'react-grid-system'
import classnames from 'classnames'
import { useSocket } from '@zilahir/use-socket.io-client'
import { useStore, useDispatch } from 'react-redux'
import Icon from 'react-icons-kit'
import { copy } from 'react-icons-kit/feather/copy'
import { isEqual } from 'lodash'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import RefreshIcon from '@material-ui/icons/Refresh'
import LaunchIcon from '@material-ui/icons/Launch'
import MovieFilterIcon from '@material-ui/icons/MovieFilter'

import TextPreview from '../common/TextPreview'
import Input from '../common/Input'
import Button from '../common/Button'
import styles from './ActionSidebar.module.scss'
import { LINK, CREATE, OPEN, INLINE_LOADER } from '../../utils/consts'
import { copyPrompterObject, createNewPrompterNoAuth, updatePrompterNoAuth } from '../../store/actions/prompter'
import { apiEndpoints } from '../../utils/apiEndpoints'
import { toggleUpdateBtn } from '../../store/actions/misc'
import Loader from '../Loader'

/**
* @author zilahir
* @function ActionSidebar
* */

const ActionSidebar = () => {
	const [isPlaying, setIsPlaying] = useState(false)
	const [text, setText] = useState('')
	const [isAnimationStarted, toggleAnimation] = useState(false)
	const [scrollSpeed, setScrollSpeed] = useState(1)
	const [prompterSlug, setPrompterSlug] = useState(null)
	const [showUpdateBtn, toggleShowUpdateBtn] = useState(false)
	const [remoteAddress, setRemoteAddress] = useState(null)
	const [streamAddress, setStreamAddress] = useState(null)
	const [createLabelText, setCreateBtnLabelText] = useState(CREATE)
	const [isLoading, toggleLoading] = useState(false)

	const store = useStore()
	const dispatch = useDispatch()
	const [socket] = useSocket(process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : process.env.REACT_APP_BACKEND)
	if (socket) {
		socket.connect()
	}

	function togglePlay() {
		window.open(`/player/${prompterSlug}`, '_blank')
	}

	function createPrompter(state) {
		if (state === OPEN) {
			togglePlay()
			return
		}
		toggleLoading(true)
		setIsPlaying(!isPlaying)
		socket.emit('isPlaying', !isPlaying)
		const newPrompterObject = store.getState().text
		const { segments } = store.getState().segments
		const slug = store.getState().userPrompters.prompterSlug
		const saveObject = {
			slug,
			segments,
			projectName: `project_${slug}`,
			meta: {
				fontSize: newPrompterObject.fontSize,
				lineHeight: newPrompterObject.lineHeight,
				letterSpacing: newPrompterObject.letterSpacing,
				scrollWidth: newPrompterObject.scrollWidth,
				scrollSpeed: newPrompterObject.scrollSpeed,
				isFlipped: newPrompterObject.isFlipped,
				textAlignment: newPrompterObject.textAlignment,
				chosenFont: newPrompterObject.chosenFont,
			},
		}
		Promise.all([
			dispatch(copyPrompterObject(store.getState().text)),
			createNewPrompterNoAuth(saveObject, apiEndpoints.newPrompterWithoutAuth),
		]).then(() => {
			setTimeout(() => {
				toggleLoading(false)
				setCreateBtnLabelText(OPEN)
			}, 1000)
		})
	}

	function updatePrompter() {
		const newPrompterObject = store.getState().text
		const slug = store.getState().userPrompters.prompterSlug
		const updateObject = {
			slug,
			text: newPrompterObject.text,
			projectName: `project_${slug}`,
			meta: {
				fontSize: newPrompterObject.fontSize,
				lineHeight: newPrompterObject.lineHeight,
				letterSpacing: newPrompterObject.letterSpacing,
				scrollWidth: newPrompterObject.scrollWidth,
				scrollSpeed: newPrompterObject.scrollSpeed,
				isFlipped: newPrompterObject.isFlipped,
				textAlignment: newPrompterObject.textAlignment,
				chosenFont: newPrompterObject.chosenFont,
			},
		}
		Promise.all([
			dispatch(copyPrompterObject(store.getState().text)),
			updatePrompterNoAuth(updateObject, apiEndpoints.newPrompterWithoutAuth),
		]).then(() => {
			toggleUpdateBtn(false)
			socket.emit('updatePrompter', updateObject)
		})
	}

	useEffect(() => store.subscribe(() => {
		const hasChanged = isEqual(store.getState().text, store.getState().userPrompters.prompterObject)
		if (!hasChanged && store.getState().userPrompters.prompterObject) {
			toggleShowUpdateBtn(true)
		}
	}), [store])

	useEffect(() => store.subscribe(() => {
		const textPreview = store.getState().segments.segments.length ? store.getState().segments.segments[0].segmentText : ''
		const sp = store.getState().text.scrollSpeed
		if (typeof store.getState().userPrompters.prompterSlug !== 'undefined') {
			const slug = store.getState().userPrompters.prompterSlug
			setPrompterSlug(slug)
			setStreamAddress(`prompter.me/player/${slug}`)
			setRemoteAddress(`prompter.me/remote/${slug}`)
		}
		setScrollSpeed(sp)
		setText(textPreview)
	}), [store, text, scrollSpeed, prompterSlug])

	function testAnimation() {
		toggleAnimation(!isAnimationStarted)
	}

	function copyValue(whichValue) {
		switch (whichValue) {
		case 'stream':
			setStreamAddress('copied')
			setTimeout(() => {
				setStreamAddress(`prompter.me/player/${prompterSlug}`)
			}, 2000)
			break
		case 'remote':
			setRemoteAddress('copied')
			setTimeout(() => {
				setRemoteAddress(`prompter.me/remote/${prompterSlug}`)
			}, 2000)
			break
		default:
			return true
		}
		return true
	}

	return (
		<>
			<Col
				lg={3}
				className={styles.actionSidebarContainer}
			>
				<div className={styles.innerContainer}>
					<TextPreview
						text={text}
						isAnimationRunning={isAnimationStarted}
						scrollSpeed={10 - scrollSpeed}
					/>
					<div className={styles.testAnimation}>
						<Button
							type={LINK}
							onClick={() => testAnimation()}
							labelText={
								!isAnimationStarted ? 'test scroll' : 'stop scroll'
							}
						/>
					</div>
					<Input
						labelText="Stream address"
						isDisabled
						inheritedValue={streamAddress || ''}
						inputClassName={classnames(
							createLabelText !== OPEN ? styles.addressInput : null,
						)}
					>
						<CopyToClipboard
							onCopy={() => copyValue('stream')}
							text={`prompter.me/player/${prompterSlug || ''}`}
						>
							<div
								className={styles.copyIcon}
								role="button"
							>
								<Icon icon={copy} size="1em" />
							</div>
						</CopyToClipboard>
					</Input>
					<Input
						labelText="Remote phone address"
						inheritedValue={remoteAddress || ''}
						isDisabled
						inputClassName={classnames(
							createLabelText !== OPEN ? styles.addressInput : null,
						)}
					>
						<CopyToClipboard
							onCopy={() => copyValue('remote')}
							text={`prompter.me/remote/${prompterSlug || ''}`}
						>
							<div
								className={styles.copyIcon}
								role="button"
							>
								<Icon icon={copy} size="1em" />
							</div>
						</CopyToClipboard>
					</Input>
					<div className={styles.playButtonContainer}>
						<Button
							onClick={() => updatePrompter()}
							labelText="Send Updates"
							buttonClass={styles.updateBtn}
							isNegative
							isVisible={showUpdateBtn}
							icon={
								<RefreshIcon htmlColor="#ffffff" />
							}
						/>
						<Loader
							type={INLINE_LOADER}
							isLoading={isLoading}
							width={30}
							height={30}
						/>
						<Button
							onClick={() => createPrompter(createLabelText)}
							labelText={createLabelText === OPEN ? 'Open Prompter' : createLabelText}
							buttonClass={classnames(
								styles.playBtn,
								isLoading ? styles.hidden : styles.visible,
							)}
							icon={(
								createLabelText === OPEN ? <LaunchIcon htmlColor="#ffffff" /> : <MovieFilterIcon htmlColor="#ffffff" />
							)}
						/>
					</div>
				</div>
			</Col>
		</>
	)
}

export default ActionSidebar
