const InvariantError = require('../../../Commons/exceptions/InvariantError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist add comment and return added comment correctly', async () => {
      // Arrange
      const newComment = new NewComment({
        content: 'Dicoding Academy Indonesia',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addComment(newComment);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      // Arrange
      const newComment = new NewComment({
        content: 'Dicoding Academy Indonesia',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(newComment);

      // Assert
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: 'Dicoding Academy Indonesia',
        owner: 'user-123',
      }));
    });
  });

  // verifyCommentOwner
  describe('verifyCommentOwner function', () => {
    it('should throw NotFoundError if commentId not available', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-321', 'user-123'))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw AuthorizationError if owner fail verify', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-4321'))
        .rejects.toThrow(AuthorizationError);
    });

    it('should not throw NotFoundError if commentId available', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-123'))
        .resolves.not.toThrow(NotFoundError);
    });

    it('should not throw AuthorizationError if owner success verify', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-123'))
        .resolves.not.toThrow(AuthorizationError);
    });
  });

  // getCommentByThread
  describe('getCommentByThread function', () => {
    it('should throw NotFoundError if threadId not available', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);
      await UsersTableTestHelper.addUser({ id: 'user-123' });

      // Action & Assert
      await expect(commentRepositoryPostgres.getCommentByThread('thread-123'))
        .rejects.toThrow(NotFoundError);
    });

    it('should not throw NotFoundError if threadId available', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });

      // Action & Assert
      await expect(commentRepositoryPostgres.getCommentByThread('thread-123'))
        .resolves.not.toThrow(NotFoundError);
    });
  });

  // Detele Comment
  describe('deleteComment', () => {
    it('should delete comment from database', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      // Action
      await commentRepositoryPostgres.deleteComment('comment-123');

      // Assert
      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments).toHaveLength(1);
    });
  });
});
