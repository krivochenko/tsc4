import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { beginCell, Cell, toNano } from 'ton-core';
import { Task1 } from '../wrappers/Task1';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('Task1', () => {
  let code: Cell;

  beforeAll(async () => {
    code = await compile('Task1');
  });

  let blockchain: Blockchain;
  let task1: SandboxContract<Task1>;

  beforeEach(async () => {
    blockchain = await Blockchain.create();

    task1 = blockchain.openContract(Task1.createFromConfig({}, code));

    const deployer = await blockchain.treasury('deployer');

    const deployResult = await task1.sendDeploy(deployer.getSender(), toNano('0.05'));

    expect(deployResult.transactions).toHaveTransaction({
      from: deployer.address,
      to: task1.address,
      deploy: true,
      success: true,
    });
  });

  it('should get branch by hash', async () => {
    const targetBranch = beginCell().storeStringTail('Hello contest').storeRef(beginCell().endCell()).endCell();
    const tree = beginCell()
      .storeRef(beginCell().storeUint(1000, 64).endCell())
      .storeRef(
        beginCell().storeRef(targetBranch).endCell(),
      )
      .storeRef(
        beginCell().storeRef(targetBranch).endCell(),
      )
      .endCell();

    const result = await task1.getBranchByHash(66629203958529530662373939497519640522128052812722802609379231862327793982932n, tree);
    expect(result).toEqualCell(targetBranch);
  });

  it('should get tree by hash', async () => {
    const tree = beginCell()
      .storeRef(beginCell().storeUint(1000, 64).endCell())
      .storeRef(beginCell().storeStringTail('Hello contest').endCell())
      .endCell();

    const result = await task1.getBranchByHash(12909423646721913057378998529950179234958447144362480608952437071928006302861n, tree);
    expect(result).toEqualCell(tree);
  });

  it('should return empty cell', async () => {
    const targetBranch = beginCell().storeStringTail('Hello contest not found').endCell();
    const tree = beginCell()
      .storeRef(beginCell().storeUint(1000, 64).endCell())
      .storeRef(targetBranch)
      .endCell();

    const result = await task1.getBranchByHash(77884970875861551795056017255584758932617320976944370747942767089041742432724n, tree);
    expect(result).toEqualCell(beginCell().endCell());
  });

});
