import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('TicketsService', () => {
  let service: TicketsService;
  let prisma: PrismaService;

  const mockTicket = {
    id: '1',
    title: 'Test Ticket',
    description: 'Test Description',
    status: 'OPEN',
    priority: 'MEDIUM',
    progress: 0,
    requesterId: 'user-1',
    requester: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
    assignedToId: null,
    assignedTo: null,
    groupId: null,
    group: null,
    assetId: null,
    asset: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    ticket: {
      create: jest.fn().mockResolvedValue(mockTicket),
      findMany: jest.fn().mockResolvedValue([mockTicket]),
      findUnique: jest.fn().mockResolvedValue(mockTicket),
      update: jest.fn().mockResolvedValue(mockTicket),
      delete: jest.fn().mockResolvedValue(mockTicket),
      count: jest.fn().mockResolvedValue(1),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a ticket', async () => {
      const createTicketDto = {
        title: 'Test Ticket',
        description: 'Test Description',
        priority: 'MEDIUM',
      };

      const result = await service.create(createTicketDto, 'user-1');

      expect(result).toEqual(mockTicket);
      expect(prisma.ticket.create).toHaveBeenCalledWith({
        data: {
          title: createTicketDto.title,
          description: createTicketDto.description,
          priority: createTicketDto.priority,
          requesterId: 'user-1',
          groupId: undefined,
          assetId: undefined,
        },
        include: {
          requester: true,
          assignedTo: true,
          group: true,
          asset: true,
        },
      });
    });

    it('should use default priority if not provided', async () => {
      const createTicketDto = {
        title: 'Test Ticket',
        description: 'Test Description',
      };

      await service.create(createTicketDto, 'user-1');

      expect(prisma.ticket.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            priority: 'MEDIUM',
          }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return array of tickets with pagination', async () => {
      const result = await service.findAll({ skip: 0, take: 20 });

      expect(Array.isArray(result.data)).toBe(true);
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('pageSize');
    });

    it('should filter by status', async () => {
      await service.findAll({ status: 'OPEN' });

      expect(prisma.ticket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'OPEN',
          }),
        }),
      );
    });

    it('should filter by priority', async () => {
      await service.findAll({ priority: 'HIGH' });

      expect(prisma.ticket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            priority: 'HIGH',
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a ticket by id', async () => {
      const result = await service.findOne('1');

      expect(result).toEqual(mockTicket);
      expect(prisma.ticket.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          requester: true,
          assignedTo: true,
          group: true,
          asset: true,
        },
      });
    });

    it('should throw NotFoundException if ticket not found', async () => {
      jest.spyOn(prisma.ticket, 'findUnique').mockResolvedValueOnce(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a ticket', async () => {
      const updateTicketDto = {
        title: 'Updated Title',
        status: 'IN_PROGRESS',
      };

      const result = await service.update('1', updateTicketDto);

      expect(result).toEqual(mockTicket);
      expect(prisma.ticket.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateTicketDto,
        include: {
          requester: true,
          assignedTo: true,
          group: true,
          asset: true,
        },
      });
    });

    it('should throw NotFoundException if ticket not found', async () => {
      jest.spyOn(prisma.ticket, 'update').mockRejectedValueOnce(
        new NotFoundException('Ticket not found'),
      );

      await expect(service.update('invalid-id', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a ticket', async () => {
      const result = await service.delete('1');

      expect(result).toEqual(mockTicket);
      expect(prisma.ticket.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
});
