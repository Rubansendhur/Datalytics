import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayEventsComponent } from './display-events.component';

describe('DisplayEventsComponent', () => {
  let component: DisplayEventsComponent;
  let fixture: ComponentFixture<DisplayEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisplayEventsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisplayEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
