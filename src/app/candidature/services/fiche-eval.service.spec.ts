import { TestBed } from '@angular/core/testing';

import { FicheEvalService } from './fiche-eval.service';

describe('FicheEvalService', () => {
  let service: FicheEvalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FicheEvalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
