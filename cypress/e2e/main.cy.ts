describe('Main Component E2E Tests', () => {
  const mockLaunches = [
    {
      mission_name: 'Test Mission',
      flight_number: 1,
      launch_date_utc: '2023-01-01T00:00:00Z',
      rocket: {
        rocket_id: 'falcon9',
        cost_per_launch: 1000000,
        second_stage: {
          payloads: [
            { payload_id: 'p1', payload_type: 'Satellite' },
            { payload_id: 'p2', payload_type: 'Dragon' },
          ],
        },
      },
    },
  ];

  beforeEach(() => {
    cy.intercept(
      'GET',
      'https://api.spacexdata.com/v3/launches',
      mockLaunches
    ).as('getLaunches');
    cy.intercept('GET', 'https://api.spacexdata.com/v3/rockets/*', {
      rocket_id: 'falcon9',
      cost_per_launch: 1000000,
    }).as('getRocket');
  });

  it('should display loading state initially', () => {
    cy.visit('/');
    cy.contains('Loading...').should('be.visible');
  });

  it('should display total cost and launch list after loading', () => {
    cy.visit('/');
    cy.wait(['@getLaunches', '@getRocket']);

    cy.contains('Total Cost of Launches: $1000000').should('exist');
    cy.contains('Test Mission').should('be.visible');
  });

  it('should update payload type', () => {
    cy.visit('/');
    cy.wait(['@getLaunches', '@getRocket']);

    cy.contains('p', 'Payload Type: Dragon')
      .next('button')
      .should('contain', 'Change payload type')
      .click();

    cy.contains('p', 'Payload Type: Dragon').should('not.exist');
  });
});
