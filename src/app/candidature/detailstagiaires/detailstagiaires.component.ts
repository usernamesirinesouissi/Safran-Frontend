import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { CandidatureService } from '../candidature.service';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';
import { DemandeService } from 'src/app/demandestage/demande.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EvaluationService } from '../evaluation.service';

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPresent?: boolean; 
  isStartOfPresenceStreak?: boolean; 
  isEndOfPresenceStreak?: boolean;   
  isInPresenceStreak?: boolean;  
    isSelected?: boolean;    
}

interface BackendPresence {
  id: number;
  datePresence: string; 


}
export interface PresenceCreationRequestDto {
  candidatId: number;
  presenceDates: string[]; 
}
@Component({
  selector: 'app-detailstagiaires',
  templateUrl: './detailstagiaires.component.html',
  styleUrls: ['./detailstagiaires.component.css']
})
export class DetailstagiairesComponent implements OnInit {
 
  candidat: any;
  candidatures: any[] = []; 
  affectedCandidature: any = null; 
  activeInternship: any = null;
  candidatImage: string = '../../../assets/images/portrait/small/avatar-s-9.png';

  entretiensForCandidat: any[] = [];
 isHistoriqueModalOpen: boolean = false; 
  breadcrumb: any;
isCvModalOpen: boolean = false;
  cvDataUrl: SafeResourceUrl | null = null; 
  cvFileNameForDownload: string | null = null; 
  isLoadingCv: boolean = false;
  currentView: 'month' | 'week' | 'day' = 'month';
  currentDate: Date = new Date();
  currentDisplayMonth: string;
  currentDisplayYear: number;
weeks: CalendarDay[][] = [];
  weekdays: string[] = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  
  selectedDates: Set<string> = new Set();
  isSelectingRange: boolean = false;
  selectionStartDate: Date | null = null;
  hoveredDateDuringSelection: Date | null = null;
  backendPresenceDates: Set<string> = new Set(); 

  
 staticPresenceDays: number[] = [
    new Date().getDate() - 1, 
    new Date().getDate(), 
    new Date().getDate() + 1,
    5, 6,
    10, 
    21 
  ];
  constructor(
      private evaluationService: EvaluationService,
    private candidatService: CandidatureService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private sanitizer: DomSanitizer,
     private location: Location,  private http: HttpClient, 
    private renderer: Renderer2,
    private el: ElementRef 
  ) {
  this.currentDisplayMonth = this.currentDate.toLocaleDateString('fr-FR', { month: 'long' });
    this.currentDisplayYear = this.currentDate.getFullYear();
  }

  ngOnInit(): void {
    
    this.updateCalendarDisplay();

    const candidatIdParam = this.route.snapshot.paramMap.get('id');
    if (!candidatIdParam) {
      this.toastr.error('ID du candidat manquant.', 'Erreur');
      this.router.navigate(['/stagiaires']);
      return;
    }
    const candidatId = +candidatIdParam;

    this.loadCandidatDetails(candidatId);
    this.loadCandidaturesForCandidat(candidatId);
    this.loadEntretiensForCandidat(candidatId);
   this.loadBackendPresences(candidatId); // << NEW: Load existing presences

    // Global mouseup listener to finalize range selection
    this.renderer.listen('window', 'mouseup', () => {
      if (this.isSelectingRange) {
        this.finalizeDateRangeSelection();
      }
    });
  } 
  


  loadBackendPresences(candidatId: number): void {
    if (!candidatId && candidatId !== 0) {
      console.error('Invalid candidatId for loading presences:', candidatId);
      this.toastr.error('ID du candidat invalide pour charger les présences.');
      return;
    }

    this.candidatService.loadPresencesForCandidat(candidatId).subscribe({
      next: (presencesFromApi: BackendPresence[]) => {
        this.backendPresenceDates.clear();
        if (presencesFromApi && Array.isArray(presencesFromApi)) {
          presencesFromApi.forEach(p => {
            if (p && p.datePresence) {

              const dateStr = p.datePresence.split('T')[0];
              this.backendPresenceDates.add(dateStr);
            }
          });
        }
        this.updateCalendarDisplay(); 
        console.log('Backend presences loaded via Service:', this.backendPresenceDates);
      },
      error: (error: any) => { 
        console.error('Error loading backend presences (from Service):', error);

        const isNotFoundError = error.message && error.message.includes('Error Code: 404');

        if (isNotFoundError) {
            this.backendPresenceDates.clear();
            this.updateCalendarDisplay();
            console.info(`No presences found for candidatId: ${candidatId} (404 received).`);

        } else {
            this.toastr.error(error.message || 'Erreur lors du chargement des présences.');
        }
      }
    });
  }

  saveSelectedPresences(): void {
    if (!this.candidat || !this.candidat.id) {
      this.toastr.error('ID du candidat non disponible pour sauvegarder les présences.');
      return;
    }
    if (this.selectedDates.size === 0) {
      this.toastr.info('Aucune date sélectionnée à sauvegarder.');
      return;
    }

    const payload: PresenceCreationRequestDto = {
      candidatId: this.candidat.id,
      presenceDates: Array.from(this.selectedDates) // Dates should be "YYYY-MM-DD"
    };

    this.candidatService.savePresences(payload).subscribe({
      next: (response) => { // response type is 'any' from the service, or you can type it if known
        this.toastr.success(`Présence(s) enregistrée(s) avec succès!`);
        // It's good practice to reload backend presences to reflect the saved state
        // or merge the newly saved presences into backendPresenceDates
        this.selectedDates.forEach(dateStr => this.backendPresenceDates.add(dateStr));
        this.selectedDates.clear();
        this.updateCalendarDisplay(); // Refresh calendar
        console.log('Presences saved:', response);
      },
      error: (error: any) => {
        console.error('Error saving presences (from Service):', error);
        this.toastr.error(error.message || 'Erreur lors de la sauvegarde des présences.');
      }
    });
  }
  goBack(): void {
    this.location.back();
  }

  loadCandidatDetails(id: number): void {
    this.candidatService.getCandidatById(id).subscribe(
      data => {
        this.candidat = data;
        this.loadCandidateImage(this.candidat.photoPath);
        
      },
      err => {
        this.toastr.error('Impossible de charger les détails du candidat.', 'Erreur');
        console.error(err);
      }
    );
  }

  /*loadCandidaturesForCandidat(candidatId: number): void {
    this.candidatService.getCandidaturesByCandidatId(candidatId).subscribe(
      (data: any[]) => { 
        this.candidatures = data;

        this.affectedCandidature = data.find(
          c => c.statutCandidatureLabel && c.statutCandidatureLabel.trim().toLowerCase() === 'affecte'
        );

        if (this.affectedCandidature) {
            this.activeInternship = {
                dateDebut: this.affectedCandidature.demandeDateDebut || this.affectedCandidature.dateDepot, 
                dateFin: this.affectedCandidature.demandeDateFin || null, 
                titre: this.affectedCandidature.demandeIntitule || 'Stage Affecté'
            };

        } else {
            this.activeInternship = this.findActiveInternship(data);
        }

      },
      err => console.error('Erreur chargement candidatures:', err)
    );
  }*/

  loadCandidateImage(photoPath: string | null | undefined): void {
    if (!photoPath) {
      this.candidatImage = '../../../assets/images/portrait/small/avatar-s-9.png';
      return;
    }
    const imageName = photoPath.split('\\').pop()?.split('/').pop();
    if (!imageName) {
      this.candidatImage = '../../../assets/images/portrait/small/avatar-s-9.png';
      return;
    }
    this.candidatService.getImageBase64(imageName).subscribe(
      (base64: string) => { this.candidatImage = base64; },
      () => { this.candidatImage = '../../../assets/images/portrait/small/avatar-s-9.png'; }
    );
  }
openCvModal(cvPath: string | null | undefined): void {
    if (!cvPath) {
      this.toastr.error('Chemin du CV non disponible.', 'Erreur');
      return;
    }

    const fileName = cvPath.split(/[\\/]/).pop();
    if (!fileName) {
      this.toastr.error('Nom de fichier CV invalide.', 'Erreur');
      return;
    }

    this.isLoadingCv = true;
    this.isCvModalOpen = true;
    this.cvDataUrl = null;

    this.candidatService.getImageBase64(fileName).subscribe(
      (fullDataUrl: string) => { 

        if (fullDataUrl && fullDataUrl.startsWith('data:application/pdf;base64,')) {
          this.cvDataUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fullDataUrl);
          this.cvFileNameForDownload = fileName;
        } else {

          console.warn('Received data URL is not for a PDF:', fullDataUrl);
          this.toastr.error('Le fichier CV n\'est pas au format PDF ou est corrompu.', 'Erreur de Format');
          this.cvDataUrl = null; 
        }
        this.isLoadingCv = false;
      },
      (error) => {
        console.error('Error loading CV via getImageBase64:', error);
        let errorMessage = 'Impossible de charger le CV. Veuillez réessayer.';
        if (error.status === 404) {
            errorMessage = 'Le fichier CV est introuvable sur le serveur.';
        }
        this.toastr.error(errorMessage, 'Erreur');
        this.isLoadingCv = false;
      }
    );
  }

  closeCvModal(): void {
    this.isCvModalOpen = false;
    this.cvDataUrl = null;
    this.cvFileNameForDownload = null;
    this.isLoadingCv = false;
  }

  findActiveInternship(candidatures: any[]): any {
    if (!candidatures || candidatures.length === 0) return null;
    const potentialInternship = candidatures.find(
       c => c.demandeDateDebut && c.demandeDateFin // Adjust based on your actual DTO structure
    );
    if (potentialInternship) {
      return {
        dateDebut: potentialInternship.demandeDateDebut,
        dateFin: potentialInternship.demandeDateFin,
        titre: potentialInternship.demandeIntitule || 'Stage en cours'
      };
    }
    return null;
  }


  calculateInternshipProgress(internship: any): number {
    if (!internship || !internship.dateDebut || !internship.dateFin) return 0;
    const startDate = new Date(internship.dateDebut).getTime();
    const endDate = new Date(internship.dateFin).getTime();
    const today = new Date().getTime();

    if (endDate < startDate) return 0; // Should not happen for valid stages
    const totalDuration = endDate - startDate;
    if (totalDuration === 0) return today >= startDate ? 100 : 0;

    if (today < startDate) return 0;
    if (today >= endDate) return 100;

    const elapsedDuration = today - startDate;
    const progress = (elapsedDuration / totalDuration) * 100;
    return Math.min(Math.max(progress, 0), 100);
  }

  getSafeCvUrl(cvPath: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(cvPath);
  }

  isEntretienPlannedForAnyCandidature(): boolean {
    return this.entretiensForCandidat && this.entretiensForCandidat.length > 0;
  }

   loadEntretiensForCandidat(candidatId: number): void {
    this.candidatService.loadEntretiens(candidatId).subscribe(
        data => {
            this.entretiensForCandidat = data;
            
        },
        err => {
            console.error('Erreur chargement entretiens:', err);
            this.toastr.error('Erreur lors du chargement de l\'historique des entretiens.', 'Erreur');
        }
    );
  }

  openHistoriqueModal(): void {
    if (this.candidat && this.candidat.id) {

        this.isHistoriqueModalOpen = true;
    } else {
        this.toastr.warning('Données du candidat non encore chargées.', 'Attention');
    }
  }

  closeHistoriqueModal(): void {
    this.isHistoriqueModalOpen = false;
  }
   updateCalendarDisplay(): void {
    this.currentDisplayMonth = this.currentDate.toLocaleDateString('fr-FR', { month: 'long' });
    this.currentDisplayYear = this.currentDate.getFullYear();
    this.generateCalendarDays(this.currentDisplayYear, this.currentDate.getMonth());
  }  
  
  private formatDateToYYYYMMDD(date: Date): string {
    const d = new Date(date);
    const month = '' + (d.getMonth() + 1);
    const day = '' + d.getDate();
    const year = d.getFullYear();
    return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
  }
 onDayMouseDown(dayObj: CalendarDay): void {
    if (!dayObj.isCurrentMonth) return; // Only allow selection in current month

    this.isSelectingRange = true;
    this.selectionStartDate = dayObj.date;
    this.hoveredDateDuringSelection = dayObj.date; // Initialize hover with start date

    // For single click toggle:
    const dateStr = this.formatDateToYYYYMMDD(dayObj.date);
    if (this.selectedDates.has(dateStr)) {
      this.selectedDates.delete(dateStr);
    } else {
      this.selectedDates.add(dateStr);
    }
    this.updateCalendarDaySelectionState(dayObj.date, this.selectedDates.has(dateStr));
  }

  onDayMouseEnter(dayObj: CalendarDay): void {
    if (this.isSelectingRange && dayObj.isCurrentMonth && this.selectionStartDate) {
        this.hoveredDateDuringSelection = dayObj.date;
        this.updateCalendarDisplay(); 
    }
  }


  finalizeDateRangeSelection(): void {
    if (!this.isSelectingRange || !this.selectionStartDate || !this.hoveredDateDuringSelection) {
      this.isSelectingRange = false;
      this.selectionStartDate = null;
      this.hoveredDateDuringSelection = null;
      return;
    }

    const start = new Date(Math.min(this.selectionStartDate.getTime(), this.hoveredDateDuringSelection.getTime()));
    const end = new Date(Math.max(this.selectionStartDate.getTime(), this.hoveredDateDuringSelection.getTime()));

    let currentDateInRange = new Date(start);
    const tempSelectedDates = new Set<string>();

    while (currentDateInRange <= end) {
      const dayDateObj = this.findCalendarDayObject(currentDateInRange);
      if (dayDateObj && dayDateObj.isCurrentMonth) {
          const dateStr = this.formatDateToYYYYMMDD(currentDateInRange);
          tempSelectedDates.add(dateStr);
      }
      currentDateInRange.setDate(currentDateInRange.getDate() + 1);
    }

    tempSelectedDates.forEach(dateStr => {
        if (this.selectedDates.has(dateStr)) {

        } else {
            this.selectedDates.add(dateStr);
        }
    });


    this.isSelectingRange = false;
    this.selectionStartDate = null;
    this.hoveredDateDuringSelection = null;
    this.updateCalendarDisplay(); // Final re-render
  }

  private findCalendarDayObject(date: Date): CalendarDay | undefined {
    for (const week of this.weeks) {
      const foundDay = week.find(d => d.date.toDateString() === date.toDateString());
      if (foundDay) return foundDay;
    }
    return undefined;
  }

  private updateCalendarDaySelectionState(date: Date, isSelected: boolean): void {
    const dayObj = this.findCalendarDayObject(date);
    if (dayObj) {
      dayObj.isSelected = isSelected;
    }
  }

  isDateInHoverRange(date: Date): boolean {
    if (!this.isSelectingRange || !this.selectionStartDate || !this.hoveredDateDuringSelection) {
        return false;
    }
    const checkTime = date.getTime();
    const startTime = Math.min(this.selectionStartDate.getTime(), this.hoveredDateDuringSelection.getTime());
    const endTime = Math.max(this.selectionStartDate.getTime(), this.hoveredDateDuringSelection.getTime());
    return checkTime >= startTime && checkTime <= endTime;
  }


  processPresenceStreaks(): void {
    for (let week of this.weeks) {
      for (let i = 0; i < week.length; i++) {
        const day = week[i];
        // Reset streak properties
        day.isStartOfPresenceStreak = false;
        day.isInPresenceStreak = false;
        day.isEndOfPresenceStreak = false;

        // Re-evaluate isPresent based on backend data for streaks
        const dateStr = this.formatDateToYYYYMMDD(day.date);
        day.isPresent = this.backendPresenceDates.has(dateStr);

        if (day.isPresent && day.isCurrentMonth) { // Only process streaks for present days in current month
          const prevDayInWeek = i > 0 ? week[i-1] : this.getPreviousDayFromPreviousWeek(week, day);
          const nextDayInWeek = i < week.length - 1 ? week[i+1] : this.getNextDayFromNextWeek(week, day);

          // Check if previous/next day (could be from another week) is present
          const prevDayWasPresent = prevDayInWeek && this.backendPresenceDates.has(this.formatDateToYYYYMMDD(prevDayInWeek.date)) && prevDayInWeek.isCurrentMonth;
          const nextDayIsPresent = nextDayInWeek && this.backendPresenceDates.has(this.formatDateToYYYYMMDD(nextDayInWeek.date)) && nextDayInWeek.isCurrentMonth;

          if (!prevDayWasPresent && nextDayIsPresent) {
            day.isStartOfPresenceStreak = true;
          }
          if (prevDayWasPresent && !nextDayIsPresent) {
            day.isEndOfPresenceStreak = true;
          }
          if (prevDayWasPresent && nextDayIsPresent) {
            day.isInPresenceStreak = true;
          }
        }
      }
    }
  }  
  
  private getPreviousDayFromPreviousWeek(currentWeek: CalendarDay[], currentDay: CalendarDay): CalendarDay | null {
    const currentWeekIndex = this.weeks.indexOf(currentWeek);
    if (currentWeekIndex > 0 && this.weeks[currentWeekIndex-1]) {
        // Is currentDay the first day of its week?
        if (currentWeek.indexOf(currentDay) === 0) {
            return this.weeks[currentWeekIndex-1][6]; // Last day of previous week
        }
    }
    return null;
  }

  private getNextDayFromNextWeek(currentWeek: CalendarDay[], currentDay: CalendarDay): CalendarDay | null {
    const currentWeekIndex = this.weeks.indexOf(currentWeek);
    if (currentWeekIndex < this.weeks.length - 1 && this.weeks[currentWeekIndex+1]) {
        // Is currentDay the last day of its week?
        if (currentWeek.indexOf(currentDay) === 6) {
            return this.weeks[currentWeekIndex+1][0]; // First day of next week
        }
    }
    return null;
  }

generateCalendarDays(year: number, month: number): void {
    this.weeks = [];
    const firstDayOfMonth = new Date(year, month, 1);
    let startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - (startDate.getDay() === 0 ? 6 : startDate.getDay() - 1)); // Start from Monday

    for (let i = 0; i < 6; i++) { // Always generate 6 weeks for consistent layout
      const currentWeekData: CalendarDay[] = [];
      for (let j = 0; j < 7; j++) {
        const dayDate = new Date(startDate);
        const dateStr = this.formatDateToYYYYMMDD(dayDate);

       currentWeekData.push({
  date: dayDate,
  isCurrentMonth: dayDate.getMonth() === month,
  isToday: this.isToday(dayDate),
  isPresent: this.backendPresenceDates.has(dateStr), // SOLELY from backend
  isSelected: this.selectedDates.has(dateStr) || this.isDateInHoverRange(dayDate),
});

        startDate.setDate(startDate.getDate() + 1);
      }
      this.weeks.push(currentWeekData);
    }
     this.processPresenceStreaks();
  }

  
  setView(view: 'month' | 'week' | 'day'): void {
    this.currentView = view;
  }

  prevMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.updateCalendarDisplay();
  }

  nextMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.updateCalendarDisplay();
  }

  goToToday(): void {
    this.currentDate = new Date();
    this.updateCalendarDisplay();
  }
isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }
  isCurrentMonth(date: Date): boolean {
    return date.getMonth() === this.currentDate.getMonth() &&
           date.getFullYear() === this.currentDate.getFullYear();
  }

  isSelected(date: Date): boolean {
    return false;
  }

  getEventsForDate(date: Date): any[] {
    return [];
  }

  handlePlanifierEntretienClick(): void {
    this.toastr.info('La fonctionnalité de planification d\'entretien sera ajoutée ultérieurement.');
    console.log('Planifier entretien pour candidat ID:', this.candidat?.id);
  }

 loadCandidaturesForCandidat(candidatId: number): void {
  this.candidatService.getCandidaturesByCandidatId(candidatId).subscribe(
    (data: any[]) => {
      // Pour le débogage, gardons cette ligne. Elle a été très utile.
      console.log('Données BRUTES des candidatures reçues du backend:', data);

      this.candidatures = data;

      // ===================================================================
      // CORRECTION FINALE BASÉE SUR LE LOG DE LA CONSOLE
      // ===================================================================
      // Le log montre que le backend envoie le libellé du statut dans la propriété `statutCandidatureLabel`.
      // Nous devons donc comparer cette chaîne de caractères.

      const statutRecherche = "Affecté à un besoin";
      this.affectedCandidature = data.find(
        c => c.statutCandidatureLabel && c.statutCandidatureLabel.trim() === statutRecherche
      );

      // Logique existante qui suit
      if (this.affectedCandidature) {
        console.log(`Candidature avec le label "${statutRecherche}" trouvée avec succès :`, this.affectedCandidature);
        this.activeInternship = {
          dateDebut: this.affectedCandidature.demandeDateDebut || this.affectedCandidature.dateDepot,
          dateFin: this.affectedCandidature.demandeDateFin || null,
          titre: this.affectedCandidature.demandeIntitule || 'Stage Affecté'
        };
      } else {
        // Ce message ne devrait plus apparaître.
        console.warn(`AUCUNE candidature avec le label "${statutRecherche}" n'a été trouvée. Vérifiez qu'il n'y a pas de faute de frappe ou d'espace inattendu.`);
        this.activeInternship = this.findActiveInternship(data);
      }
    },
    err => console.error('Erreur lors du chargement des candidatures:', err)
  );
}



/**
 * Nouvelle fonction séparée pour lancer l'appel au service.
 * Cela rend le code plus propre et réutilisable.
 * @param candidatureId L'ID de la candidature à évaluer.
 */
/*private proceedToEvaluation(candidatureId: number): void {
    this.evaluationService.getOrCreateEvaluationForCandidature(candidatureId).subscribe({
        next: (evaluation) => {
            if (evaluation && evaluation.id) {
                console.log(`[Détail Stagiaire] Évaluation obtenue/créée (ID: ${evaluation.id}). Navigation...`);
                this.toastr.success('Ouverture du dossier d\'évaluation...', 'Succès');
                this.router.navigate(['/evaluation-parcours', evaluation.id]);
            } else {
                console.error('[Détail Stagiaire] La réponse du service d\'évaluation est invalide (pas d\'ID).', evaluation);
                this.toastr.error('La réponse du serveur pour l\'évaluation est invalide.');
            }
        },
        error: (rawError) => {
            // Log de l'erreur brute pour le débogage. C'est LA ligne la plus importante.
            console.error('[Détail Stagiaire] ERREUR BRUTE DU BACKEND lors de la récupération/création de l\'évaluation:', rawError);
            
            // On essaie d'extraire un message d'erreur plus précis
            const errorMessage = rawError.error?.message 
                               || rawError.message 
                               || 'Le serveur a refusé de créer le dossier d\'évaluation. Vérifiez les logs du serveur.';
            
            this.toastr.error(errorMessage, 'Erreur du Serveur');
        }
    });
}*/

handleEvaluationClick(): void {
    let candidatureToEvaluate: any = null;

    // On cherche en priorité la candidature "Affecté"
    if (this.affectedCandidature && this.affectedCandidature.id) {
        candidatureToEvaluate = this.affectedCandidature;
    } 
    // Sinon, on prend la première de la liste pour tenter le coup
    else if (this.candidatures && this.candidatures.length > 0) {
        candidatureToEvaluate = this.candidatures[0];
        this.toastr.info('Tentative d\'évaluation avec la première candidature disponible.', 'Information');
    }

    if (candidatureToEvaluate && candidatureToEvaluate.id) {
        const candidatureId = candidatureToEvaluate.id;
        console.log(`[Détail Stagiaire] Redirection vers la page d'évaluation pour la candidature ID: ${candidatureId}`);
        
       
       this.router.navigate(['/candidature/evaluation', candidatureId]);

    } else {
        // Si vraiment aucune candidature n'existe, on affiche une erreur
        this.toastr.error('Aucune candidature n\'est associée à ce stagiaire. Évaluation impossible.', 'Action impossible');
        console.error('[Détail Stagiaire] Clic sur "Évaluer" mais aucune candidature trouvée.');
    }
}




   }