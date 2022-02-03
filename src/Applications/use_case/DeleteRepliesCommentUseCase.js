class DeleteRepliesCommentUseCase {
  constructor({
    repliesCommentRepository,
    commentRepository,
    threadRepository,
  }) {
    this._repliesCommentRepository = repliesCommentRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);
    const { threadId, commentId, repliesId, owner } = useCasePayload;
    await this._threadRepository.checkAvailabilityThread(threadId);
    await this._commentRepository.checkAvailabilityComment(commentId);
    await this._repliesCommentRepository.verifyRepliesCommentOwner(repliesId, owner);
    await this._repliesCommentRepository.deleteRepliesComment(repliesId);
  }

  _validatePayload({ repliesId, commentId, threadId, owner }) {
    if (!repliesId || !commentId || !threadId || !owner)
      throw new Error('DELETE_REPLIES_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');

    if (typeof repliesId !== 'string' || typeof commentId !== 'string' || typeof threadId !== 'string' || typeof owner !== 'string')
      throw new Error('DELETE_REPLIES_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  }
}

module.exports = DeleteRepliesCommentUseCase;
