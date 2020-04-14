import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Col } from 'react-grid-system'
import Toggle from 'react-toggle'
import 'react-toggle/style.css'

import SliderAlt from '../common/SliderAlt'
import Selector from '../common/Selector'
import Logo from '../common/Logo'
import { scrollWidthSettngs } from '../../utils/consts'
import { SET_FONT_SIZE, SET_LINE_HEIGHT, SET_LETTER_SPACING, SET_SCROLL_SPEED } from '../../store/actions/actionTypes'
import styles from './EditorSidebar.module.scss'
import './Toggle.scss'
import { toggleMirror } from '../../store/actions/text'

/**
* @author zilahir
* @function EditorSidebar
* */

const EditorSidebar = () => {
	const dispatch = useDispatch()
	function handleFlip(boolean) {
		dispatch(toggleMirror(boolean.target.checked))
	}

	const fontSize = useSelector(state => state.text.fontSize)
	const letterSpacing = useSelector(state => state.text.letterSpacing)
	const lineHeight = useSelector(state => state.text.lineHeight)
	const scrollSpeed = useSelector(state => state.text.scrollSpeed)
	const flipped = useSelector(state => state.text.isFlipped)

	return (
		<>
			<Col
				lg={3}
				className={styles.editorSidebarContainer}
			>
				<div className={styles.innerContainer}>
					<Logo />
					<SliderAlt
						labelText="Text size"
						sliderName={SET_FONT_SIZE}
						initialValue={fontSize}
						maxValue={10}
						step={1}
					/>
					<SliderAlt
						labelText="Letter spacing"
						sliderName={SET_LETTER_SPACING}
						initialValue={letterSpacing}
						minValue={0}
						maxValue={2}
						step={0.01}
					/>
					<SliderAlt
						labelText="Line height"
						sliderName={SET_LINE_HEIGHT}
						initialValue={lineHeight}
						step={0.1}
						maxValue={3}
						minValue={1}
					/>
					<div className={styles.selectorContainer}>
						<p className={styles.widthLabel}>
								Scroll width
						</p>
						<Selector items={scrollWidthSettngs} />
					</div>
					<SliderAlt
						labelText="Scroll speed"
						sliderName={SET_SCROLL_SPEED}
						initialValue={scrollSpeed}
						maxValue={10}
						step={1}
					/>
					<div className="toggleWrapper">
						<p>
							Flip for reflection
						</p>
						<Toggle
							onChange={bool => handleFlip(bool)}
							checked={flipped}
							icons={null}
						/>
					</div>
				</div>
			</Col>
		</>
	)
}

export default EditorSidebar
