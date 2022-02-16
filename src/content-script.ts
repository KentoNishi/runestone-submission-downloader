import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Diff2HtmlUI } from 'diff2html/lib-esm/ui/js/diff2html-ui.js';
import { createPatch } from 'diff/lib/index.es6';
const THEME = '#0f1b84';

const questionsElement = Array.from(document.querySelectorAll('h3'))
  .filter(e => e.textContent === 'Questions')[0]
  .parentElement;

const cleanse = (s: string) => s.replace(/[^a-z0-9]/gi, '_').toLowerCase();

const getSubmission = async (problem: string, student: string) => {
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
  return data;
};

const getGrade = async (problem: string, student: string) => {
  const data = await (await fetch(`https://runestone.academy/runestone/admin/getGradeComments?acid=${problem}&sid=${student}`, {
    method: 'GET',
  })).json() as GradeResponse;
  return data;
};

const getProblems = () => (
  Array.from(
    (
      document.querySelector('#questionselector') as HTMLSelectElement
    ).selectedOptions
  ) as HTMLOptionElement[]
).map(e => e.value);

const getStudents = () => (
  Array.from(document.querySelectorAll('#studentselector option')) as HTMLOptionElement[]
).map(e => ({ id: e.value, name: e.textContent }));

const sendRequests = async (statusElement: HTMLDivElement) => {
  statusElement.textContent = 'Starting...';
  const zip = JSZip();
  const problems = getProblems();
  const students = getStudents();
  const promises = [];
  problems.forEach(problem => {
    students.forEach(student => {
      const filename = `${cleanse(problem)}/${student.id}_${student.name.replaceAll(' ', '_')}.py`;
      promises.push((async () => {
        let done = false;
        while (!done) {
          try {
            const data = await getSubmission(problem, student.id);
            statusElement.textContent = `Downloaded ${filename}`;
            zip.file(filename, data.detail.history.pop());
            done = true;
          } catch (e) {
            statusElement.textContent = `Retrying ${filename}`;
          }
        }
      })());
    });
  });
  await Promise.allSettled(promises);
  const zipName = `${problems.map(cleanse).join('+')}.zip`;
  statusElement.textContent = `Zipping ${zipName}`;
  saveAs(await zip.generateAsync({ type: 'blob' }), zipName);
  statusElement.textContent = `Downloaded ${zipName}`;
};

const getButton = () => {
  const b = document.createElement('button');
  b.className = 'btn btn-primary';
  b.style.setProperty('background-color', THEME, 'important');
  b.style.display = 'block';
  const s = document.createElement('div');
  s.style.display = 'block';
  const w = document.createElement('div');
  w.appendChild(b);
  w.appendChild(s);
  return { wrapper: w, button: b, status: s };
};

const createDownloaderButton = () => {
  const { button: b, status: s, wrapper: w } = getButton();
  b.innerText = 'Download All Student Submissions for Selected Problems';
  questionsElement.appendChild(w);
  b.addEventListener('click', e => {
    b.blur();
    sendRequests(s);
  });
};

const mark2Of2s = async (statusElement: HTMLDivElement) => {
  statusElement.textContent = 'Starting...';
  const problems = getProblems();
  const students = getStudents();
  const promises = [];
  const suspicious: {
    problem: string;
    student: { name: string; id: string; };
  }[] = [];
  problems.forEach(problem => {
    students.forEach(async student => {
      promises.push((async () => {
        const { grade } = await getGrade(problem, student.id);
        if (grade === 10) {
          let done = false;
          while (!done) {
            try {
              const history = (await getSubmission(problem, student.id))
                .detail.history;
              if (history.length === 2) {
                suspicious.push({
                  problem,
                  student: {
                    name: student.name,
                    id: student.id
                  },
                });
              }
              statusElement.textContent = `Downloaded ${student.name}'s ${problem} submission`;
              done = true;
            } catch (e) {
              statusElement.textContent = `Retrying ${student.name}'s ${problem} submission`;
            }
          }
        }
      })());
    });
  });
  await Promise.allSettled(promises);
  statusElement.textContent = '';
  const label = document.createElement('div');
  label.innerText = 'Suspicious Submissions:';
  statusElement.appendChild(label);
  suspicious.forEach(({ problem, student }) => {
    const problemElement = document.createElement('div');
    problemElement.style.backgroundColor = 'rgb(150, 150, 150);';
    problemElement.style.color = 'white';
    problemElement.style.padding = '5px';
    problemElement.style.margin = '5px';
    problemElement.style.width = 'fit-content';
    problemElement.style.backgroundColor = '#1f1f1f';
    problemElement.style.borderRadius = '5px';
    problemElement.textContent = `${problem} by ${student.name}`;
    const diffElement = document.createElement('div');
    diffElement.style.display = 'none';
    problemElement.appendChild(diffElement);
    statusElement.appendChild(problemElement);
    let show = false;
    let initial = true;
    let diffLib: Diff2HtmlUI | undefined = undefined;
    problemElement.addEventListener('click', async e => {
      diffElement.style.display = show ? 'none' : 'block';
      show = !show;
      if (initial) {
        initial = false;
        const submission = (await getSubmission(problem, student.id))
          .detail.history;
        console.log(submission);
        const initialSubmission = submission[0] ?? '';
        const finalSubmission = submission[1] ?? '';
        initial = false;
        const parsed = createPatch(
          'submission.py',
          initialSubmission,
          finalSubmission,
          '',
          ''
        );
        diffLib = new Diff2HtmlUI(
          diffElement,
          parsed
        );
        diffLib.draw();
        diffElement.style.display = 'block';
      }
    });
    diffElement.addEventListener('click', e => e.stopPropagation());
  });
};

const createMark2Of2Button = () => {
  const { button: b, status: s, wrapper: w } = getButton();
  b.innerText = 'Retrieve Fullscore 2 of 2 Submissions for Selected Problems';
  questionsElement.appendChild(w);
  b.addEventListener('click', e => {
    b.blur();
    mark2Of2s(s);
  });
};

createDownloaderButton();
createMark2Of2Button();
