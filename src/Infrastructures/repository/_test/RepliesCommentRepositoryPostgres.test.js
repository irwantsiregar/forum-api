const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NewRepliesComment = require('../../../Domains/comments/entities/NewRepliesComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const pool = require('../../database/postgres/pool');
const RepliesCommentRepositoryPostgres = require('../RepliesCommentRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('RepliesCommentRepositoryPostgres', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addRepliesComment function', () => {
    it('should persist add replies comment and return added replies comment correctly', async () => {
      // Arrange
      const newRepliesComment = new NewRepliesComment({
        content: 'Dicoding Academy Indonesia',
        threadId: 'thread-123',
        commentId: 'comment-123',
        owner: 'user-123',
      });

      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const fakeIdGenerator = () => '123'; // stub!
      const repliesCommentRepositoryPostgres = new RepliesCommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await repliesCommentRepositoryPostgres.addRepliesComment(newRepliesComment);

      // Assert
      const repliesComments = await RepliesTableTestHelper.findRepliesCommentById('replies-123');
      expect(repliesComments).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      // Arrange
      const newRepliesComment = new NewRepliesComment({
        content: 'Dicoding Academy Indonesia',
        threadId: 'thread-123',
        commentId: 'comment-123',
        owner: 'user-123',
      });

      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const fakeIdGenerator = () => '123'; // stub!
      const repliesCommentRepositoryPostgres = new RepliesCommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedRepliesComment = await repliesCommentRepositoryPostgres.addRepliesComment(newRepliesComment);

      // Assert
      expect(addedRepliesComment).toStrictEqual(new AddedComment({
        id: 'replies-123',
        content: 'Dicoding Academy Indonesia',
        owner: 'user-123',
      }));
    });
  });

  // verifyRepliesCommentOwner
  describe('verifyRepliesCommentOwner function', () => {
    it('should throw NotFoundError if repliesId not available', async () => {
      // Arrange
      const repliesCommentRepositoryPostgres = new RepliesCommentRepositoryPostgres(pool);
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await RepliesTableTestHelper.addRepliesComment({ id: 'replies-123' });

      // Action & Assert
      await expect(repliesCommentRepositoryPostgres.verifyRepliesCommentOwner('replies-321', 'user-123'))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw AuthorizationError if owner fail verify', async () => {
      // Arrange
      const repliesCommentRepositoryPostgres = new RepliesCommentRepositoryPostgres(pool);
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await RepliesTableTestHelper.addRepliesComment({ id: 'replies-123' });

      // Action & Assert
      await expect(repliesCommentRepositoryPostgres.verifyRepliesCommentOwner('replies-123', 'user-4321'))
        .rejects.toThrow(AuthorizationError);
    });

    it('should not throw NotFoundError if repliesId available', async () => {
      // Arrange
      const repliesCommentRepositoryPostgres = new RepliesCommentRepositoryPostgres(pool);
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await RepliesTableTestHelper.addRepliesComment({ id: 'replies-123' });

      // Action & Assert
      await expect(repliesCommentRepositoryPostgres.verifyRepliesCommentOwner('replies-123', 'user-123'))
        .resolves.not.toThrow(NotFoundError);
    });

    it('should not throw AuthorizationError if owner success verify', async () => {
      // Arrange
      const repliesCommentRepositoryPostgres = new RepliesCommentRepositoryPostgres(pool);
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await RepliesTableTestHelper.addRepliesComment({ id: 'replies-123' });

      // Action & Assert
      await expect(repliesCommentRepositoryPostgres.verifyRepliesCommentOwner('replies-123', 'user-123'))
        .resolves.not.toThrow(AuthorizationError);
    });
  });

  // getRepliesCommentByThread
  describe('getRepliesCommentByThread function', () => {
    it('should throw NotFoundError if threadId not available', async () => {
      // Arrange
      const repliesCommentRepositoryPostgres = new RepliesCommentRepositoryPostgres(pool);
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await RepliesTableTestHelper.addRepliesComment({ id: 'replies-123' });

      // Action & Assert
      await expect(repliesCommentRepositoryPostgres.getRepliesCommentByThread('thread-321'))
        .rejects.toThrow(NotFoundError);
    });

    it('should not throw NotFoundError if threadId available', async () => {
      // Arrange
      const repliesCommentRepositoryPostgres = new RepliesCommentRepositoryPostgres(pool);
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await RepliesTableTestHelper.addRepliesComment({ id: 'replies-123' });

      // Action & Assert
      await expect(repliesCommentRepositoryPostgres.getRepliesCommentByThread('thread-123'))
        .resolves.not.toThrow(NotFoundError);
    });
  });

  // Detele RepliesComment
  describe('deleteRepliesComment', () => {
    it('should delete comment from database', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await RepliesTableTestHelper.addRepliesComment({ id: 'replies-123' });
      const repliesCommentRepositoryPostgres = new RepliesCommentRepositoryPostgres(pool);

      // Action
      await repliesCommentRepositoryPostgres.deleteRepliesComment('replies-123');

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesCommentById('replies-123');
      expect(replies).toHaveLength(1);
    });
  });
});
