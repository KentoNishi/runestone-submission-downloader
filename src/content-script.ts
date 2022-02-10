import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const questionsElement = Array.from(document.querySelectorAll('h3'))
  .filter(e => e.textContent === 'Questions')[0]
  .parentElement;

const sendRequests = async () => {
  const zip = JSZip();
  const problems = (
    Array.from(document.querySelectorAll('#questionselector option')) as HTMLOptionElement[]
  ).map(e => e.value);
  const students = (
    Array.from(document.querySelectorAll('#studentselector option')) as HTMLOptionElement[]
  ).map(e => e.value);
  console.log(problems, students);
  const promises = [];
  problems.forEach(problem => {
    students.forEach(student => {
      promises.push((async () => {
        const data = await (await fetch('https://runestone.academy/ns/assessment/gethist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            acid: problem,
            sid: student,
          }),
        })).json() as HistoryResponse;
        zip.file(`${problem}/${student}.py`, data.detail.history.pop());
      })());
    });
  });
  await Promise.allSettled(promises);
  saveAs(await zip.generateAsync({ type: 'blob' }), 'submissions.zip');
};

const createButton = () => {
  if (document.querySelector('#custom-button')) return;
  const b = document.createElement('button');
  b.className = 'btn btn-primary';
  b.id = 'custom-button';
  b.innerText = 'Download All Student Submissions for Selected Problems';
  b.style.setProperty('background-color', '#0f1b84', 'important');
  b.style.display = 'block';
  questionsElement.appendChild(b);
  b.addEventListener('click', e => {
    b.blur();
    sendRequests();
  });
};

createButton();
