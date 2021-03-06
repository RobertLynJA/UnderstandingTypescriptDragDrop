import { DragTarget } from "../interfaces/DragTarget";
import { Project } from "./Project";
import { Component } from "./Component";
import { ProjectItem } from "./ProjectItem";
import { autobind } from "../decorators/autobind";
import { ProjectStatus } from "../enums/ProjectStatus";
import { projectState } from "./ProjectState";

export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
    assignedProjects: Project[];

    constructor(private type: 'active' | 'finished') {
        super('project-list', 'app', false, `${type}-projects` );

        this.assignedProjects = [];

        this.configure();
        this.renderContent();
    }

    private renderProjects() {
        const listEl = document.getElementById(`${this.type}-projects-list`)!;

        listEl.innerHTML = '';

        for (const projItem of this.assignedProjects) {
            new ProjectItem(this.element.querySelector('ul')!.id, projItem);
        }
    }

    renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
    }

    @autobind
    dragOverHandler(event: DragEvent): void {
        if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
            event.preventDefault();
            const listEl = this.element.querySelector('ul')!;
            listEl.classList.add('droppable');
        }
    }

    @autobind
    dropHandler(event: DragEvent): void {
        const projectId = event.dataTransfer!.getData('text/plain');
        projectState.moveProject(projectId, (this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished ));
    }
    
    @autobind
    dragLeaveHandler(_event: DragEvent): void {
        const listEl = this.element.querySelector('ul')!;
        listEl.classList.remove('droppable');
    }

    configure() {
        this.element.addEventListener('dragover', this.dragOverHandler);
        this.element.addEventListener('drop', this.dropHandler);
        this.element.addEventListener('dragleave', this.dragLeaveHandler);
        
        
        projectState.addListener((projects: Project[]) => {
            const relevantProjects = projects.filter(prj => {
                if (this.type === 'active') {
                    return prj.status === ProjectStatus.Active;
                } 

                return prj.status === ProjectStatus.Finished;
            })
            this.assignedProjects = relevantProjects;
            this.renderProjects();
        });
    }
}