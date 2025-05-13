  document.querySelectorAll('[contenteditable="true"]').forEach(el => {
  el.classList.add('wave-effect');
});
  // Material Wave Effect (delegated)
  document.addEventListener('click', function (e) {
    const target = e.target.closest('.wave-effect');
    if (!target || window.getSelection().toString().length > 0) return;

    const wave = document.createElement('span');
    wave.className = 'wave';
    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);

    wave.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${e.clientX - rect.left - size / 2}px;
      top: ${e.clientY - rect.top - size / 2}px;
    `;

    target.appendChild(wave);
    setTimeout(() => wave.remove(), 600);
  });
  
    // LocalStorage Save/Load
    const editableElements = document.querySelectorAll('[contenteditable="true"]');
    editableElements.forEach(element => {
      const storageKey = `resume_${element.id || element.className || element.tagName}_${element.innerText.slice(0, 10)}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) element.innerHTML = saved;
      element.addEventListener('input', () => {
        localStorage.setItem(storageKey, element.innerHTML);
      });
    });
  
    // Add new language input on "+" click
    const addBtn = document.querySelector('.add-language-btn');
    const languagesList = document.querySelector('.languages-list');
  
    addBtn.addEventListener('click', () => {
      const newLang = document.createElement('span');
      newLang.contentEditable = true;
      newLang.className = 'wave-effect';
      newLang.textContent = 'Новый язык';
      languagesList.insertBefore(newLang, addBtn);
  
      // Включаем сохранение в localStorage для нового элемента
      const storageKey = `resume_languages_${Date.now()}`;
      newLang.addEventListener('input', () => {
        localStorage.setItem(storageKey, newLang.innerHTML);
      });
    });
  
    // PDF Button logic
    document.getElementById('download-btn').addEventListener('click', generatePDF);
  
  function generatePDF() {
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Используем поддерживаемый шрифт
    doc.setFont("helvetica"); // или "times", "courier"
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255); // Белый текст

    addHeaderToPDF(doc);

    let yPos = 40;
    yPos = addSectionToPDF(doc, 'Опыт работы', '.experience-item', yPos);
    yPos = addSectionToPDF(doc, 'Образование', '.education-item', yPos + 10);
    yPos = addInterestsToPDF(doc, yPos + 10);
    addContactInfoToPDF(doc, yPos + 10);

    doc.save('resume.pdf');
  } catch (error) {
    console.error('PDF generation error:', error);
    alert('Ошибка при создании PDF. Попробуйте снова.');
  }
}

function addHeaderToPDF(doc) {
  const header = document.querySelector('.resume-header');
  if (!header) return;

  doc.setFontSize(22);
  doc.setTextColor(255, 70, 85); // Красный текст
  doc.text(20, 20, document.querySelector('.header-left h1')?.textContent.trim() || '');
  doc.setFontSize(16).setTextColor(169, 169, 169); // Светло-серый текст
  doc.text(20, 28, document.querySelector('.header-left p')?.textContent.trim() || '');

  const languages = Array.from(document.querySelectorAll('.languages-list span'))
    .map(el => el.textContent.trim()).join(', ');
  doc.setFontSize(12).setTextColor(255, 255, 255); // Белый текст
  doc.text(20, 36, `Языки: ${languages}`);
}

function addSectionToPDF(doc, title, selector, yPos) {
  doc.setFontSize(18).setTextColor(255, 70, 85).text(20, yPos, title); // Красный заголовок
  const items = document.querySelectorAll(selector);
  if (items.length === 0) return yPos + 10;

  const tableData = Array.from(items).map(item => {
    const period = item.querySelector('.experience-period, .education-period')?.textContent.trim() || '';
    const title = item.querySelector('h3')?.textContent.trim() || '';
    const company = item.querySelector('.experience-company, .education-institution')?.textContent.trim() || '';
    const description = getDescriptionText(item);
    const tags = getTagsText(item);

    return [
      period,
      `${title}\n${company}`,
      `${description}${tags ? '\nТеги: ' + tags : ''}`
    ];
  });

  doc.autoTable({
    startY: yPos + 10,
    head: [['Период', 'Позиция', 'Описание']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [45, 55, 72], // Тёмно-серый фон заголовков таблицы
      textColor: [255, 255, 255], // Белый текст
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 50 },
      2: { cellWidth: 'auto' }
    },
    styles: {
      fontSize: 10,
      cellPadding: 3,
      lineColor: [44, 62, 80],
      lineWidth: 0.2,
      textColor: [255, 255, 255], // Белый текст для строк
      fillColor: [0, 0, 0] // Чёрный фон
    }
  });

  return doc.lastAutoTable.finalY;
}

function addInterestsToPDF(doc, yPos) {
  const interests = document.querySelectorAll('.interests-list span');
  if (interests.length === 0) return yPos;

  doc.setFontSize(18).setTextColor(255, 70, 85).text(20, yPos, 'Интересы'); // Красный текст
  doc.setFontSize(12).setTextColor(255, 255, 255); // Белый текст
  doc.text(20, yPos + 8,
    Array.from(interests).map(el => el.textContent.trim()).join(', '));

  return yPos + 15;
}

function addContactInfoToPDF(doc, yPos) {
  const contact = document.querySelector('.contact-info');
  if (!contact) return;

  doc.setFontSize(14).setTextColor(169, 169, 169) // Светло-серый текст
    .text(20, yPos, contact.textContent.trim());
}

function getDescriptionText(item) {
  const descEl = item.querySelector('.experience-description, .education-description');
  if (!descEl) return '';

  return Array.from(descEl.querySelectorAll('li'))
    .map(li => '• ' + li.textContent.trim())
    .join('\n');
}

function getTagsText(item) {
  const tagsEl = item.querySelector('.tags');
  if (!tagsEl) return '';
  
  return Array.from(tagsEl.querySelectorAll('span'))
    .map(span => span.textContent.trim())
    .join(', ');
}
