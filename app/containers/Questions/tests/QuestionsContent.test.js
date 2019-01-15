import QuestionsContent, { QuestionItem } from '../QuestionsContent';

const props = {
  questionsList: [
    {
      answers: [],
      id: 1,
    },
  ],
  locale: 'en',
};

jest.mock('utils/datetime', () => ({
  getTimeFromDateToNow: jest.fn(),
}));

describe('QuestionsContent', () => {
  it('QuestionsContent, snapshot test', () => {
    expect(QuestionsContent(props)).toMatchSnapshot();
  });

  it('QuestionItem, snapshot test', () => {
    const obj = {
      answers: [],
    };
    expect(QuestionItem(obj)).toMatchSnapshot();
  });
});