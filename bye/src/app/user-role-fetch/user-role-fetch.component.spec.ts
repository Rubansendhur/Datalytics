import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRoleFetchComponent } from './user-role-fetch.component';

describe('UserRoleFetchComponent', () => {
  let component: UserRoleFetchComponent;
  let fixture: ComponentFixture<UserRoleFetchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserRoleFetchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserRoleFetchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
