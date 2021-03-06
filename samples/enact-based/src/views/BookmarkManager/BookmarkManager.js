// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/**
 * Contains the declaration for the BookmarkManager component.
 *
 */

import Button from '@enact/moonstone/Button';
import {connect} from 'react-redux';
import Notification from '@enact/moonstone/Notification';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Scroller from '@enact/moonstone/Scroller';

import BookmarkList from './BookmarkList';
import {selectAllBookmarks, deselectAllBookmarks} from '../../actions';

import css from './BookmarkManager.less';

class BookmarkManagerBase extends Component {

	static propTypes = {
		browser: PropTypes.object,
		data: PropTypes.array,
		selectedIndices: PropTypes.array,
		deselectAllBookmark: PropTypes.func,
		selectAllBookmark: PropTypes.func,
	}

	constructor (props) {
		super(props);
		this.state = {
			deletePopupOpen: false
		};
	}

	onSelectAll = () => {
		const {data} = this.props;
		if (data.length === this.props.hasSelection) {
			this.props.deselectAllBookmarks();
		} else {
			const ids = [];
			for (let i = 0; i < data.length; i++) {
				ids.push(i);
			}
			this.props.selectAllBookmarks(ids);
		}
	}

	onDelete = () => {
		this.setState({deletePopupOpen: true});
	}

	onDeleteYes = () => {
		const {data, selectedIndices} = this.props;
		if (data.length === this.props.hasSelection) {
			this.props.browser.bookmarks.removeAllBookmarks();
		} else {
			const urls = [];
			for (let i = 0 ; i < data.length; i++) {
				if (selectedIndices.includes(i)) {
					urls.push(data[i].url);
				}
			}
			this.props.browser.bookmarks.removeBookmarks(urls);
		}

		this.props.deselectAllBookmarks();
		this.setState({deletePopupOpen: false});
	}

	onDeleteNo = () => {
		this.setState({deletePopupOpen: false});
	}

	render () {
		const {browser, data, hasSelection, ...rest} = this.props;
		delete rest.selectedIndices;
		delete rest.selectAllBookmarks;
		delete rest.deselectAllBookmarks;

		return (
			<div className={css.bookmarkManager} {...rest}>
				<Button css={css} onClick={this.onSelectAll} disabled={!data.length} small>{(data.length && data.length === hasSelection) ? 'Deselect All' : 'Select All'}</Button>
				<Button css={css} onClick={this.onDelete} disabled={!data.length || !hasSelection} small>Delete</Button>
				<Notification
					open={this.state.deletePopupOpen}
					noAutoDismiss
				>
					<span>{(data.length === hasSelection) ?
						'Do you want to delete all bookmarks?'
						: 'Do you want to delete the selected bookmark(s)?'}</span>
					<buttons>
						<Button onClick={this.onDeleteNo}>No</Button>
						<Button onClick={this.onDeleteYes}>Yes</Button>
					</buttons>
				</Notification>
				{
					(data.length > 0) ?
					<Scroller horizontalScrollbar="hidden" className={css.list}>
						<BookmarkList browser={browser}/>
					</Scroller>
					:
					<div className={css.noItem}>
						{'There is no bookmark.'}
						<br />
						{'If you\'re on a webpage you\'d like to bookmark, simply click the button at the end of the address bar.'}
					</div>
				}
			</div>
		);
	}
}

const mapStateToProps = ({bookmarksState, bookmarkUIState}) => ({
	data: bookmarksState.data,
	selectedIndices: bookmarkUIState.selected,
	hasSelection: bookmarkUIState.selected.length
});

const mapDispatchToProps = (dispatch) => ({
	selectAllBookmarks: (ids) => dispatch(selectAllBookmarks(ids)),
	deselectAllBookmarks: () => dispatch(deselectAllBookmarks())
});

const BookmarkManager = connect(mapStateToProps, mapDispatchToProps)(BookmarkManagerBase);

export default BookmarkManager;
export {BookmarkManager};
