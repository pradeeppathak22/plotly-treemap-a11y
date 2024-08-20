import { Component } from '@angular/core';
import { TreemapInteractionService } from 'plotly-a11y';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
    title = 'plotly-treemap-a11y';
    public graph = {
        data: {
            type: "treemap",
            labels: ["Root", "A", "B", "C", "D", "E", "F"],
            parents: ["", "Root", "Root", "A", "A", "B", "B"],
            values: [10, 20, 30, 15, 5, 10, 5],
            textinfo: "label+value",
            marker: {
                colors: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7],
                colorscale: "Viridis"
            }
        },
        layout: {
            title: "Sample Plotly Treemap",
            height: 500,
            width: 800
        }
    };
    constructor(private treemapInteractionService: TreemapInteractionService) { }

    heatmapLoaded() {
        console.log('heatmap loaded');
        this.treemapInteractionService.addKeyboardInteractions('plotly-plot');
    }
}
