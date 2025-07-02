import { Component, OnInit } from '@angular/core';
import { ParametragesService } from '../services/parametrages.service';
import { NgForm } from '@angular/forms';
import { NumberSymbol } from '@angular/common';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-parametrages',
  templateUrl: './parametrages.component.html',
  styleUrls: ['./parametrages.component.css'],
})
export class ParametragesComponent implements OnInit {
  selectedCard: string = '';
  currentData: any[] = [];
  newItem: string = '';
  editingItem: any = null;
  errorMessage: string = '';
  successMessage: string = '';
  searchTerm: string = '';
  filteredData: any[] = [];
  parameters: string[] = [];  // Liste des paramètres ajoutés
  newParamName: string = '';
  allParameters: any[] = []; // Pour stocker tous les paramètres

  tabs = [
    { name: 'Compétences RH', displayName: 'Compétences RH' },
    { name: 'Compétences Technique', displayName: 'Compétences Technique' },
    { name: 'Ecole', displayName: 'Ecole' },
    { name: 'Unité Opérationnel', displayName: 'UO' },
    { name: 'Formation Académique', displayName: 'Formation Académique' },
    { name: 'Type Stage', displayName: 'Type Stage' },
    { name: 'Statut', displayName: 'Statut' },
      { name: 'Niveau Evaluation', displayName: 'Niveau Evaluation' },
  ];

  breadcrumb: any;
  parametragesService: any;
  params: any;
  newParameter: any;
  modalService: any;
  showModal: boolean;
  parametrages: any;

  constructor(private paramService: ParametragesService, private toastr: ToastrService, private http: HttpClient) {}

  ngOnInit(): void {
    this.breadcrumb = {
      mainlabel: 'Paramétrages',
      links: [
        { name: 'Dashboard', isLink: true, link: '/dashboard/sales' },
        { name: 'Paramétrage', isLink: true, link: '/parametrages/parametrages' },
      ],
    };
    
    // Sélectionner le premier onglet par défaut
    if (this.tabs.length > 0) {
      this.selectCard(this.tabs[0].name);
    }

    // Charger tous les paramètres au démarrage
    this.loadAllParameters();
  }

  // Méthode pour charger tous les paramètres
  loadAllParameters(): void {
    this.paramService.getAllParameters().subscribe(
      (data: any[]) => {
        this.allParameters = data;
        console.log('Tous les paramètres:', this.allParameters);
      },
      (error) => {
        console.error('Erreur lors du chargement des paramètres:', error);
      }
    );
  }

  // Méthode pour afficher tous les paramètres dans l'onglet
  showAllParameters(): void {
    this.selectedCard = 'Tous les paramètres';
    this.currentData = this.allParameters;
    this.filteredData = [...this.currentData];
  }

  ajouterNouvelOnglet(): void {
    const trimmedName = this.newParamName.trim();
    if (!trimmedName) {
      this.toastr.warning('Le nom du paramétrage est requis.', 'Erreur');
      return;
    }
  
    const parametre = { nom: trimmedName };
  
    this.http.post('http://localhost:8083/api/parametrages/ajouter', parametre, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa('admin:admin')  // si besoin d'authentification
      })
    }).subscribe({
      next: (res: any) => {
        console.log("Ajout réussi :", res);
  
        // Ajout de l'onglet dans la UI
        this.tabs.push({ name: trimmedName, displayName: trimmedName });
        this.parametrages[trimmedName] = [];
        this.selectedCard = trimmedName;
        this.newParamName = '';
        this.toastr.success('Paramètre ajouté avec succès !', 'Succès');
        
        // Recharger tous les paramètres après ajout
        this.loadAllParameters();
      },
      error: (err) => {
        console.error("Erreur lors de l'ajout :", err);
        this.toastr.error('Erreur ', 'Erreur');
      }
    });
  }

  selectCard(card: string, event?: any): void {
    if (event) {
      event.preventDefault();
    }
    this.selectedCard = card;
    
    if (card === 'Tous les paramètres') {
      this.showAllParameters();
    } else {
      this.loadData(card); 
    }
    
    this.newItem = '';
    this.editingItem = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  loadData(card: string): void {
    this.errorMessage = '';
    console.log('Chargement des données pour :', card);
  
    this.paramService.getData(card).subscribe(
      (data) => {
        if (data && Array.isArray(data)) {
          console.log('Données récupérées :', data);
          this.currentData = data.map(item => ({
            id: item.id || item._id || item.ID,
            ...item
          }));
          this.filteredData = [...this.currentData];
        } else {
          this.errorMessage = `Aucune donnée disponible pour ${card}`;
          this.currentData = [];
          this.filteredData = [];
        }
      },
      (error) => {
        this.errorMessage = 'Erreur lors du chargement des données.';
        console.error(error);
        this.currentData = [];
        this.filteredData = [];
      }
    );
  }

  filterItems(): void {
    if (!this.searchTerm.trim()) {
      this.filteredData = [...this.currentData];
    } else {
      const fieldName = this.getFieldName();
      this.filteredData = this.currentData.filter((item) =>
        item[fieldName]?.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  addItem(form: NgForm): void {
    if (!this.newItem.trim()) {
      this.errorMessage = 'Veuillez saisir un nom.';
      return;
    }
    
    const fieldName = this.getFieldName();
    const newItemData: any = {};
    newItemData[fieldName] = this.newItem.trim();
  
    this.paramService.addData(this.selectedCard, newItemData).subscribe(
      (response) => {
        this.toastr.success('Élément ajouté avec succès.', 'Succès', { timeOut: 3000, disableTimeOut: true, closeButton: true });
        
        const newItemWithId = { id: response.id, ...newItemData };
        this.filteredData.unshift(newItemWithId);

        this.newItem = '';
        form.reset();
        
        // Recharger tous les paramètres après ajout
        this.loadAllParameters();
      },
      (error) => {
        this.errorMessage = error.status === 409 ? "Cet élément existe déjà." : "Erreur lors de l'ajout de l'élément.";
        this.toastr.error(this.errorMessage, 'Erreur');
      }
    );
  }

  editItem(item: any): void {
    if (!item || !item.id) {
      console.error("Élément à éditer non défini.");
      this.errorMessage = "Élément à éditer non défini.";
      return;
    }
  
    console.log("Édition de l'élément :", item);
    this.editingItem = { ...item }; 
  }
  
  updateItem(): void {
    if (!this.editingItem || !this.editingItem.id) {
      console.error("Élément à mettre à jour non défini !");
      this.errorMessage = "Élément à mettre à jour non défini !";
      this.toastr.warning("Élément à mettre à jour non défini !", "Attention", {
        timeOut: 3000,
        closeButton: true
      });
      return;
    }
  
    console.log("Mise à jour de l'élément :", this.editingItem);
  
    this.paramService.updateData(this.selectedCard, this.editingItem.id, this.editingItem)
      .subscribe(
        (response) => {
          const index = this.filteredData.findIndex(item => item.id === this.editingItem.id);
          if (index !== -1) {
            this.filteredData[index] = { ...this.editingItem }; 
          }
  
          this.toastr.success('Élément mis à jour avec succès !', 'Succès', {
            timeOut: 3000,
            closeButton: true
          });
  
          this.editingItem = null;
          
          // Recharger tous les paramètres après mise à jour
          this.loadAllParameters();
        },
        (error) => {
          console.error("Erreur lors de la mise à jour :", error);
          this.errorMessage = "Erreur lors de la mise à jour de l'élément.";
          this.toastr.error("Erreur lors de la mise à jour de l'élément.", 'Erreur', {
            timeOut: 5000,
            closeButton: true
          });
        }
      );
  }
  
  cancelEdit(): void {
    this.editingItem = null;
  }
  
  deleteItem(id: any): void {
    if (!id) {
      console.error("ID de l'élément non défini !");
      this.errorMessage = "ID de l'élément non défini !";
      this.toastr.warning("ID de l'élément non défini !", "Attention", {
        timeOut: 3000,
        closeButton: true
      });
      return;
    }
  
    Swal.fire({
      title: "Êtes-vous sûr de vouloir supprimer cet élément ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Supprimer",
      cancelButtonText: "Annuler"
    }).then((result) => {
      if (result.isConfirmed) {
        this.paramService.deleteData(this.selectedCard, id)
          .subscribe(
            (response) => {
              Swal.fire("Supprimé !", "L'élément a été supprimé avec succès.", "success");
  
              this.toastr.success("Élément supprimé avec succès !", "Succès", {
                timeOut: 3000,
                closeButton: true
              });
  
              this.successMessage = 'Élément supprimé avec succès !';
              this.filteredData = this.filteredData.filter(item => item.id !== id);
              
              // Recharger tous les paramètres après suppression
              this.loadAllParameters();
            },
            (error) => {
              console.error("Erreur lors de la suppression :", error);
              Swal.fire("Erreur !", "Impossible de supprimer l'élément.", "error");
              this.errorMessage = "Erreur lors de la suppression de l'élément.";
              this.toastr.error("Erreur lors de la suppression de l'élément.", "Erreur", {
                timeOut: 5000,
                closeButton: true
              });
            }
          );
      }
    });
  }

  getFieldName(): string {
    const mapping = {
      'Compétences RH': 'nomCompetence',
      'Compétences Technique': 'nomExigence',
      'Ecole': 'nomEcole',
      'Unité Opérationnel': 'nomUO',
      'Formation Académique': 'nomFormation',
      'Type Stage': 'nomTypeStage',
      'Statut': 'nomStatut',
      'Niveau Evaluation': 'nomNiveau',
      'Tous les paramètres': 'nom' // Champ par défaut pour tous les paramètres
    };
    return mapping[this.selectedCard] || 'nom';
  }
}