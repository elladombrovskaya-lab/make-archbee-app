applyTagValues('Hello {{name}}, order {{orderId}}.', { docId: 'abc123', name: 'Alice', orderId: '' });
// expected: "Hello Alice, order {{orderId}}." (orderId left unchanged because the field was blank)
