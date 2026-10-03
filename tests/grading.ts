import {fixture} from './fixtures';
import {gradeSubmission,normalizeEnumAnswer} from '../shared/grading';
const assert=(condition:boolean,message:string)=>{if(!condition)throw Error(message)};

const tf=fixture(['true_false_not_given'],1,3);const [first,second]=tf.content.questionGroups[0].questions;tf.answerKey.answers[0].acceptedAnswers=['NOTGIVEN'];
const tfGrade=gradeSubmission([tf.content],[tf.answerKey],{[first.id]:'not given',[second.id]:' true '});
assert(tfGrade.correct===2&&tfGrade.unanswered===1&&tfGrade.total===3,'TF/NG normalization or unanswered score failed');
assert(normalizeEnumAnswer('NOTGIVEN')==='NOT GIVEN','Legacy NOTGIVEN normalization failed');

const multiple=fixture(['multiple_choice_multiple'],1,2);const [a,b]=multiple.content.questionGroups[0].questions;
const reversed=gradeSubmission([multiple.content],[multiple.answerKey],{[a.id]:'B',[b.id]:'A'});
assert(reversed.correct===2&&reversed.total===2,'Unordered MCQ should award both slots');
const duplicate=gradeSubmission([multiple.content],[multiple.answerKey],{[a.id]:'A',[b.id]:'A'});
assert(duplicate.correct===1&&duplicate.incorrect===1,'Duplicate MCQ choice must not score twice');

const short=fixture(['short_answer']);const q=short.content.questionGroups[0].questions[0];short.answerKey.answers[0].acceptedAnswers=['water tank','covered tank'];
const textGrade=gradeSubmission([short.content],[short.answerKey],{[q.id]:'  WATER   TANK  '});
assert(textGrade.correct===1,'Text case/whitespace normalization failed');
console.log('PASS grading: NOTGIVEN/NOT GIVEN, blank, text variants, unordered MCQ and duplicate selection');
