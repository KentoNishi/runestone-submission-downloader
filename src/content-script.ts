import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const questionsElement = Array.from(document.querySelectorAll('h3'))
  .filter(e => e.textContent === 'Questions')[0]
  .parentElement;

const cleanse = (s: string) => s.replace(/[^a-z0-9]/gi, '_').toLowerCase();

const sendRequests = async (statusElement: HTMLDivElement) => {
  const zip = JSZip();
  const problems = (
    Array.from(
      (
        document.querySelector('#questionselector') as HTMLSelectElement
      ).selectedOptions
    ) as HTMLOptionElement[]
  ).map(e => e.value);
  const students = (
    Array.from(document.querySelectorAll('#studentselector option')) as HTMLOptionElement[]
  ).map(e => ({ id: e.value, name: e.textContent }));
  const promises = [];
  problems.forEach(problem => {
    students.forEach(student => {
      const filename = `${cleanse(problem)}/${student.id}_${student.name.replaceAll(' ', '_')}.py`;
      promises.push((async () => {
        let done = false;
        while (!done) {
          try {
            const data = await (await fetch('https://runestone.academy/ns/assessment/gethist', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                acid: problem,
                sid: student.id,
              }),
            })).json() as HistoryResponse;
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

const createButton = () => {
  if (document.querySelector('#custom-button')) return;
  const b = document.createElement('button');
  b.className = 'btn btn-primary';
  b.id = 'custom-button';
  b.innerText = 'Download All Student Submissions for Selected Problems';
  b.style.setProperty('background-color', '#0f1b84', 'important');
  b.style.display = 'block';
  questionsElement.appendChild(b);
  const statusElement = document.createElement('div');
  statusElement.style.display = 'block';
  questionsElement.appendChild(statusElement);
  b.addEventListener('click', e => {
    b.blur();
    sendRequests(statusElement);
  });
};

createButton();
