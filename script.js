window.onload = function () {
  const STORAGE_KEY = 'modelos_guardados';
  const ELIMINADOS_KEY = 'modelos_eliminados';

  // === FUNCIÓN PARA CREAR UNA FILA DE MODELO DINÁMICO ===
  function createModelRow(nombre, estudio) {
    const id = nombre.toLowerCase().replace(/[\s\-]/g, '_');
    const contenidoPlatforms = ['F2F', 'LOYALFANS', 'ONLYFANS', 'CREATORS'];
    const traficoPlatforms = ['REDGIFS', 'FIKFAP', 'KAMS', 'XFOLLOW'];

    const tbody = document.querySelector('table tbody');
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${nombre.toUpperCase()}</td>
      <td>${estudio.toUpperCase()}</td>
      <td class="checkbox-cell">
        <div class="checkbox-container">
          ${contenidoPlatforms.map(p => `
            <input type="checkbox" id="${id}_${p.toLowerCase()}">
            <label for="${id}_${p.toLowerCase()}">${p}</label>
          `).join('')}
        </div>
      </td>
      <td class="checkbox-cell">
        <div class="checkbox-container">
          ${traficoPlatforms.map(p => `
            <input type="checkbox" id="${id}_${p.toLowerCase()}">
            <label for="${id}_${p.toLowerCase()}">${p}</label>
          `).join('')}
        </div>
      </td>
    `;

    tbody.appendChild(tr);
  }

  // === 1. RECONSTRUIR MODELOS GUARDADOS ===
  const modelosGuardados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  modelosGuardados.forEach(({ nombre, estudio }) => {
    createModelRow(nombre, estudio);
  });

  // === 2. OCULTAR MODELOS ELIMINADOS ===
  const eliminados = JSON.parse(localStorage.getItem(ELIMINADOS_KEY)) || [];
  document.querySelectorAll('table tbody tr').forEach(row => {
    const nombre = row.cells[0]?.textContent.trim().toLowerCase();
    if (eliminados.includes(nombre)) {
      row.remove();
    }
  });

  // === 3. RESTAURAR CHECKBOXES Y TEXTAREAS ===
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    const saved = localStorage.getItem(cb.id);
    if (saved) cb.checked = saved === 'true';
    cb.addEventListener('change', () => {
      localStorage.setItem(cb.id, cb.checked);
    });
  });

  document.querySelectorAll('textarea').forEach(area => {
    const saved = localStorage.getItem(area.id);
    if (saved) area.value = saved;
    area.addEventListener('input', () => {
      localStorage.setItem(area.id, area.value);
    });
  });

  // === 4. CLIC EN CELDAS PARA MARCAR EN GRUPO ===
  document.querySelectorAll('.checkbox-cell').forEach(cell => {
    cell.addEventListener('click', function (e) {
      const tag = e.target.tagName.toLowerCase();
      if (tag === 'input' || tag === 'label') return;

      const checkboxes = this.querySelectorAll('input[type="checkbox"]');
      const shouldCheck = Array.from(checkboxes).some(cb => !cb.checked);

      checkboxes.forEach(cb => {
        cb.checked = shouldCheck;
        if (cb.id) {
          localStorage.setItem(cb.id, shouldCheck);
        }
      });
    });
  });

  // === 5. BOTÓN ➕ AGREGAR MODELO ===
  document.getElementById('addModel').addEventListener('click', () => {
    const nombre = prompt('Escribe el nombre de la modelo (Ej: ANA - LUNA):');
    if (!nombre) return;

    const estudio = prompt('Escribe el nombre del estudio (Ej: ESTUDIO 1):');
    if (!estudio) return;

    const modelos = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    modelos.push({ nombre: nombre.trim(), estudio: estudio.trim() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(modelos));

    createModelRow(nombre.trim(), estudio.trim());
    setTimeout(() => window.onload(), 10);
  });

  // === 6. BOTÓN ➖ ELIMINAR MODELO ===
  document.getElementById('removeModel').addEventListener('click', () => {
    const nombre = prompt('Escribe el nombre exacto de la modelo a eliminar (Ej: ANA - LUNA):');
    if (!nombre) return;

    const nombreKey = nombre.trim().toLowerCase();
    let found = false;

    document.querySelectorAll('table tbody tr').forEach(row => {
      const cellNombre = row.cells[0]?.textContent.trim().toLowerCase();
      if (cellNombre === nombreKey) {
        row.remove();
        found = true;
      }
    });

    if (found) {
      let modelos = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      modelos = modelos.filter(m => m.nombre.toLowerCase() !== nombreKey);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(modelos));

      let eliminados = JSON.parse(localStorage.getItem(ELIMINADOS_KEY)) || [];
      if (!eliminados.includes(nombreKey)) {
        eliminados.push(nombreKey);
        localStorage.setItem(ELIMINADOS_KEY, JSON.stringify(eliminados));
      }

      const idPrefix = nombreKey.replace(/[\s\-]/g, '_');
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(idPrefix)) {
          localStorage.removeItem(key);
        }
      });

      alert('Modelo eliminada.');
    } else {
      alert('Modelo no encontrada.');
    }
  });

  // === 7. MODAL DE TAREAS ===
  const modal = document.getElementById('modal-tarea');
  const abrirModalBtn = document.getElementById('abrir-modal-tarea');
  const guardarBtn = document.getElementById('guardar-tarea');
  const cancelarBtn = document.getElementById('cancelar-tarea');
  const inputModal = document.getElementById('input-tarea-modal');
  const listaTareas = document.getElementById('lista-tareas');

  abrirModalBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
    inputModal.value = '';
    inputModal.focus();
  });

  cancelarBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  guardarBtn.addEventListener('click', () => {
    const texto = inputModal.value.trim();
    if (texto) {
      const tareas = JSON.parse(localStorage.getItem('tareas_personales')) || [];
      tareas.push({ texto, completada: false });
      localStorage.setItem('tareas_personales', JSON.stringify(tareas));
      modal.style.display = 'none';
      cargarTareas();
    }
  });

  // === 8. FUNCIONES DE TAREAS ===
  function cargarTareas() {
    const tareas = JSON.parse(localStorage.getItem('tareas_personales')) || [];
    listaTareas.innerHTML = '';
    tareas.forEach((tarea, i) => {
      const li = document.createElement('li');

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = tarea.completada;

      const span = document.createElement('span');
      span.textContent = tarea.texto;

      const btnEliminar = document.createElement('button');
      btnEliminar.textContent = '✖';
      btnEliminar.className = 'eliminar-tarea';

      checkbox.addEventListener('change', () => {
        li.classList.add('fade-out');
        setTimeout(() => {
          tareas[i].completada = true;
          localStorage.setItem('tareas_personales', JSON.stringify(tareas));
          cargarTareas();
        }, 600);
      });

      btnEliminar.addEventListener('click', () => {
        tareas.splice(i, 1);
        localStorage.setItem('tareas_personales', JSON.stringify(tareas));
        cargarTareas();
      });

      li.appendChild(checkbox);
      li.appendChild(span);
      li.appendChild(btnEliminar);
      listaTareas.appendChild(li);
    });
  }

  cargarTareas();
};

// === CERRAR MODAL con ESC o clic fuera ===
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    modal.style.display = 'none';
  }
});

window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});
