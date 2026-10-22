export class ListConversations {
  constructor({ conversationRepository, studentRepository }) {
    this.conversationRepo = conversationRepository;
    this.studentRepo = studentRepository;
  }

  async execute({ studentId }) {
    const conversations = await this.conversationRepo.findByStudentId(studentId);

    const hydrated = await Promise.all(
      conversations.map(async (conv) => {
        const otherId = conv.getOtherParticipant(studentId);
        const otherStudent = await this.studentRepo.findById(otherId);

        return {
          id: conv.id,
          participantIds: conv.participantIds,
          lastMessageAt: conv.lastMessageAt,
          otherParticipant: otherStudent
            ? {
                id: otherStudent.id,
                name: otherStudent.name,
                email: otherStudent.account.email,
                specialty: otherStudent.profile?.specialty || 'Other',
              }
            : {
                id: otherId,
                name: 'Student',
                email: '',
                specialty: 'Other',
              },
        };
      })
    );

    return hydrated;
  }
}
