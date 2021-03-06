import React from 'react';
import PropTypes from 'prop-types';
import * as routes from 'routes-config';

import Content from './Content';
import { QUESTION_TYPE } from './constants';

export const Question = props => (
  <Content
    {...props}
    answerId="0"
    type={QUESTION_TYPE}
    key={`${QUESTION_TYPE}${props.questionData.id}`}
    comments={props.questionData.comments}
    title={props.questionData.content.title}
    content={props.questionData.content.content}
    rating={props.questionData.rating}
    isItWrittenByMe={props.questionData.isItWrittenByMe}
    history={props.questionData.history}
    userInfo={props.questionData.userInfo}
    postTime={props.questionData.post_time}
    lastEditedDate={props.questionData.lastEditedDate}
    votingStatus={props.questionData.votingStatus}
    deleteItem={props.deleteQuestion}
    deleteItemLoading={props.deleteQuestionLoading}
    editItem={[
      props.redirectToEditQuestionPage,
      routes.questionEdit(props.questionData.id),
    ]}
    saveComment={props.saveComment}
    deleteComment={props.deleteComment}
    buttonParams={{
      questionId: props.questionData.id,
      answerId: 0,
      whowasvoted: props.questionData.userInfo.user,
    }}
    communities={props.communities}
  />
);

Question.propTypes = {
  questionData: PropTypes.object,
  communities: PropTypes.array,
  deleteQuestion: PropTypes.func,
  editQuestion: PropTypes.func,
  saveComment: PropTypes.func,
  redirectToEditQuestionPage: PropTypes.func,
  deleteComment: PropTypes.func,
  deleteQuestionLoading: PropTypes.bool,
};

export default React.memo(Question);
