export class GetStudentApplications {
  constructor({ applicationRepository }) {
    this.appRepo = applicationRepository;
  }

  async execute({ studentId }) {
    const apps = await this.appRepo.findByStudentId(studentId);
    return apps.map(app => app.toJSON());
  }
}
