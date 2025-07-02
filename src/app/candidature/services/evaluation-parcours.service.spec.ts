import { TestBed } from '@angular/core/testing';

import { EvaluationParcoursService } from './evaluation-parcours.service';

describe('EvaluationParcoursService', () => {
  let service: EvaluationParcoursService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EvaluationParcoursService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
