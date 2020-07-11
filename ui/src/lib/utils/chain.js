class Chain {
  constructor() {
    this.chain = [];
  }

  insert(elem) {
    // accepts {id: "my-id", func: fucntion(){}, ctx: context}
    this.chain.push(elem);
  }

  insertBefore(id, elem) {
    let index = this.chain.findIndex(elem => elem.id === id);
    this.chain.splice(index, 0, elem);
  }

  remove(id) {
    this.chain = this.chain.filter(elem => elem.id !== id);
  }

  execute(params) {
    //stop execution if method in chain returned false
    this.chain.every(elem => {
      return elem.func.call(elem.ctx, params);
    });
  }
}

export default Chain;
