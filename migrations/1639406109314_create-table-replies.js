exports.up = (pgm) => {
  pgm.createTable('replies', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    content: {
      type: 'TEXT',
      notNull: true,
    },
    date: {
      type: 'TEXT',
      notNull: true,
    },
    thread_id: {
      type: 'VARCHAR(50)',
    },
    comment_id: {
      type: 'VARCHAR(50)',
    },
    owner: {
      type: 'VARCHAR(50)',
    },
    is_delete: {
      type: 'BOOLEAN',
      default: false,
    },
  });

  pgm.addConstraint('replies', 'fk_replies.thread_id_threads.id', 'FOREIGN KEY(thread_id) REFERENCES threads(id) ON DELETE CASCADE');
  pgm.addConstraint('replies', 'fk_replies.comment_id_comments.id', 'FOREIGN KEY(comment_id) REFERENCES comments(id) ON DELETE CASCADE');
  pgm.addConstraint('replies', 'fk_replies.thread_id_users.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropConstraint('replies', 'fk_replies.thread_id_threads.id');
  pgm.dropConstraint('replies', 'fk_replies.comment_id_comments.id');
  pgm.dropConstraint('replies', 'fk_replies.thread_id_users.id');

  pgm.dropTable('replies');
};
