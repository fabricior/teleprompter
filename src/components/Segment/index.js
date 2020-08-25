import React, { useRef, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import Icon from 'react-icons-kit'
import { times } from 'react-icons-kit/fa'

import styles from './Segment.module.scss'
import Input from '../common/Input'

/**
 * @author zilahir
 * @function Segemnt
 * */

const OnseSegment = styled.div`
	border-color: ${props => props.borderColor};
`

const SegmentIndicator = styled.span`
	background-color: ${props => props.segmentColor};
`

const SegmentText = styled.textarea`
	height: ${props => props.height}px;
`

const Segment = ({
	segmentTitle,
	segmentColor,
	segmentText,
}) => {
	const thisSegmentRef = useRef(null)
	const [scrollHeight, setScrollHeight] = useState()

	useEffect(() => {
		if (thisSegmentRef.current) {
			setScrollHeight(thisSegmentRef.current.scrollHeight)
		}
	}, [])
	return (
		<OnseSegment
			className={styles.oneSegment}
			borderColor={segmentColor}
		>
			<div className={styles.segmentHeader}>
				<Input
					labelText={null}
					inputClassName={styles.segmentName}
					inheritedValue={segmentTitle}
				/>
				<ul>
					<li>
						<SegmentIndicator
							segmentColor={segmentColor}
							className={styles.segmentColorIndicator}
						/>
					</li>
					<li>
						<button type="button" className={styles.deleteBtn}>
							<Icon icon={times} />
						</button>
					</li>
				</ul>
			</div>
			<div className={styles.segmentBody}>
				<SegmentText
					ref={thisSegmentRef}
					value={segmentText}
					height={scrollHeight}
				/>
			</div>
		</OnseSegment>
	)
}

Segment.propTypes = {
	segmentColor: PropTypes.string.isRequired,
	segmentText: PropTypes.string.isRequired,
	segmentTitle: PropTypes.string.isRequired,
}

export default Segment
