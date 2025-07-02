import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-parameter',
  templateUrl: './ajouter-parametres.component.html',
  styleUrls: ['./ajouter-parametres.component.css']
})
export class AjouterParametresComponent {
  paramForm: FormGroup;
  @Output() parameterAdded = new EventEmitter<{ name: string; displayName: string }>(); // Modifier l'événement pour émettre un objet

  constructor(private fb: FormBuilder) {
    this.paramForm = this.fb.group({
      nom: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.paramForm.valid) {
      const newParam = {
        name: this.paramForm.value.nom,
        displayName: this.paramForm.value.nom 
      };
      this.parameterAdded.emit(newParam);  
    }
  }
}
