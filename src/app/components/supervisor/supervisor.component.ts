import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-supervisor',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './supervisor.component.html',
  styleUrl: './supervisor.component.css'
})
export class SupervisorComponent implements OnInit {
  currentUser: any;
  workers: User[] = [];
  selectedWorker: User | null = null;
  task: string = '';
  email: string = '';
  allTasks: any[] = [];

  constructor(private authService: AuthService) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit() {
    this.loadWorkers();
  }

  loadWorkers() {
    this.authService.getWorkers().subscribe({
      next: (workers) => {
        this.workers = workers;
        this.loadTasks();
      },
      error: (err) => {
        console.error('Error loading workers:', err);
      }
    });
  }

  loadTasks() {
    this.allTasks = [];
    const tasksObservables = this.workers.map(worker =>
      this.authService.getAssignedTasks(worker.name)
    );

    // Fetch tasks for all workers and filter by estado "en curso" or "finalizada"
    Promise.all(tasksObservables.map(obs => obs.toPromise()))
      .then(results => {
        results.forEach(tasks => {
          if (tasks) {
            const filtered = tasks.filter((task: any) => task.estado === 'en curso' || task.estado === 'finalizada');
            this.allTasks.push(...filtered);
          }
        });
      })
      .catch(err => {
        console.error('Error loading tasks:', err);
      });
  }

  onWorkerChange() {
    if (this.selectedWorker) {
      this.email = this.selectedWorker.email;
    } else {
      this.email = '';
    }
  }

  assignTask() {
    if (!this.selectedWorker || !this.task.trim()) {
      alert('Por favor, seleccione un trabajador y escriba una tarea.');
      return;
    }

    const taskData = {
      workerName: this.selectedWorker.name,
      email: this.email,
      task: this.task.trim(),
      assignedBy: this.currentUser?.name || 'Desconocido'
    };

    this.authService.assignTask(taskData).subscribe({
      next: () => {
        alert('Tarea asignada correctamente.');
        this.task = '';
        this.selectedWorker = null;
        this.email = '';
      },
      error: (err) => {
        alert('Error al asignar la tarea: ' + err.message);
      }
    });
  }
}
